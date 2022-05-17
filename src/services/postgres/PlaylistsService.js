/* eslint-disable linebreak-style */
/* eslint-disable no-underscore-dangle */
const { Pool } = require('pg');
const { nanoid } = require('nanoid');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const AuthorizationError = require('../../exceptions/AuthorizationError');
const { mapDBToModel3 } = require('../../utils');

class PlaylistsService {
  constructor(collaborationsService) {
    this._pool = new Pool();
    this._collaborationsService = collaborationsService;
  }

  async addPlaylist({ name, owner, }) {
    const id = `playlist-${nanoid(16)}`;
    

    const query = {
      text: 'INSERT INTO playlists VALUES($1, $2, $3) RETURNING id',
      values: [id, name, owner],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Playlist gagal ditambahkan');
    }

    return result.rows[0].id;
  }

  async getPlaylists(owner) {
    const query = {
        text: `SELECT playlists.id, playlists.name, users.username
      FROM playlists
      LEFT JOIN collaborations ON playlists.id = collaborations.playlist_id
      LEFT JOIN users ON users.id = playlists.owner
      WHERE playlists.owner = $1 OR collaborations.user_id = $1`,
        values: [owner],
      };

    const result = await this._pool.query(query);
  
    return result.rows.map(mapDBToModel3);
  }

  async deletePlaylistById(id) {
    const query = {
      text: 'DELETE FROM playlists WHERE id = $1 RETURNING id',
      values: [id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new NotFoundError('Playlist gagal dihapus. Id tidak ditemukan');
    }
  }

  async addSongToPlaylist( playlist_id, song_id ) {
    const id = `playlist_songs-${nanoid(16)}`;

    const song = await this._pool.query({
      text: 'SELECT * FROM songs WHERE id = $1',
      values: [song_id],
    });


    if (!song.rows.length) {
      throw new NotFoundError('Song gagal ditambahkan ke playlist karena Id song tidak dikenal');
    }

    const query = {
      text: 'INSERT INTO playlist_songs VALUES($1, $2, $3) RETURNING id',
      values: [id, playlist_id, song_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new NotFoundError('Song gagal ditambahkan ke playlist');
    }

  }

  async getSongInPlaylist(playlist_id) {

    const queryPlaylist = {
      text: `SELECT playlists.id, playlists.name, users.username FROM playlists
      LEFT JOIN users ON playlists.owner = users.id
      WHERE playlists.id = $1`,
      values: [playlist_id],
    };
    const getPlaylist = await this._pool.query(queryPlaylist);

    if (!getPlaylist.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }

    const querySong = {
      text: `SELECT songs.id, songs.title, songs.performer
      FROM playlist_songs
      LEFT JOIN songs ON playlist_songs.song_id = songs.id
      WHERE playlist_id = $1`,
      values: [playlist_id],
    };
    const song = await this._pool.query(querySong);

    return {
      id: getPlaylist.rows[0].id,
      name: getPlaylist.rows[0].name,
      username: getPlaylist.rows[0].username,
      songs: song.rows,
    }
  }

  async deleteSongInPlaylist(playlist_id, song_id) {
    const query = {
      text: `DELETE FROM playlist_songs 
      WHERE playlist_songs.playlist_id = $1 
      AND playlist_songs.song_id = $2 RETURNING id`,
      values: [playlist_id, song_id],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Song di dalam Playlist gagal dihapus. Id tidak ditemukan');
    }
  }


  async verifyPlaylistOwner(id, owner) {
    const query = {
      text: 'SELECT * FROM playlists WHERE id = $1',
      values: [id],
    };
    const result = await this._pool.query(query);
    if (!result.rows.length) {
      throw new NotFoundError('Playlist tidak ditemukan');
    }
    const playlist = result.rows[0];
    if (playlist.owner !== owner) {
      throw new AuthorizationError('Anda tidak berhak mengakses resource ini');
    }
  }

  async verifyPlaylistAccess(id, userId) {
    try {
      await this.verifyPlaylistOwner(id, userId);
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      try {
        await this._collaborationsService.verifyCollaborator(userId, id);
      } catch {
        throw error;
      }
    }
  }
}

module.exports = PlaylistsService;