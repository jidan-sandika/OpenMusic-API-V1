const { Pool } = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const NotFoundError = require('../../exceptions/NotFoundError');
const { nanoid } = require('nanoid');

class CollaborationsService {
  constructor() {
    this._pool = new Pool();
  }

  async addCollaboration(playlistId, userId) {
    const id = `collaborations-${nanoid(16)}`;

    const getUser = await this._pool.query({
        text: 'SELECT * FROM users WHERE id = $1',
        values: [userId],
    });

    if (!getUser.rows.length) {
        throw new NotFoundError('User id tidak diketahui');
    }

    const query = {
      text: 'INSERT INTO collaborations VALUES($1, $2, $3) RETURNING id',
      values: [id, userId, playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Collaboration gagal ditambahkan');
    }
    return result.rows[0].id;
  }

  async deleteCollaboration(playlistId, userId) {
    const query = {
      text: 'DELETE FROM collaborations WHERE user_id = $1 AND playlist_id = $2 RETURNING id',
      values: [ userId, playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Collaboration gagal dhapus');
    }
  }

  async verifyCollaborator(userId, playlistId) {
    const query = {
      text: 'SELECT * FROM collaborations WHERE user_id = $1 AND playlist_id = $2',
      values: [userId, playlistId],
    };
    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Kolaborasi gagal diverifikasi');
    }
  }
}

module.exports = CollaborationsService;
