/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class SongsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postSongHandler = this.postSongHandler.bind(this);
    this.getSongsHandler = this.getSongsHandler.bind(this);
    this.getSongByIdHandler = this.getSongByIdHandler.bind(this);
    this.putSongByIdHandler = this.putSongByIdHandler.bind(this);
    this.deleteSongByIdHandler = this.deleteSongByIdHandler.bind(this);
  }

  async postSongHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { title, year, performer, genre, duration, albumId } = request.payload;

      const songId = await this._service.addSong({ title, year, performer, genre, duration, albumId });

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan',
        data: {
          songId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async getSongsHandler(request) {
    if (request.query.title && !request.query.performer) {
      const { title } = request.query;
      const keyWord = title;
      const keyWord1 = title.toUpperCase();
      const keyWord2 = title.charAt(0).toUpperCase() + title.slice(1);

      const songs  = await this._service.getSongs();

      const getSong = songs.filter((song) => song.title.includes(keyWord));
      const getSong1 = songs.filter((song) => song.title.includes(keyWord1));
      const getSong2 = songs.filter((song) => song.title.includes(keyWord2));
      const arrSongs = [];

      for (const item in getSong) {
        arrSongs.push({
          id: getSong[item].id,
          title: getSong[item].title,
          performer: getSong[item].performer,
        });
      }
      for (const item in getSong1) {
        arrSongs.push({
          id: getSong1[item].id,
          title: getSong1[item].title,
          performer: getSong1[item].performer,
        });
      }
      for (const item in getSong2) {
        arrSongs.push({
          id: getSong2[item].id,
          title: getSong2[item].title,
          performer: getSong2[item].performer,
        });
      }
      return {
        status: 'success',
        data: {
          songs: arrSongs,
        }
      }
      
    } if (request.query.performer && !request.query.title) {
      const { performer } = request.query;
      const keyWord = performer;
      const keyWord1 = performer.toUpperCase();
      const keyWord2 = performer.charAt(0).toUpperCase() + performer.slice(1);

      const songs = await this._service.getSongs();

      const getSong = songs.filter((song) => song.performer.includes(keyWord));
      const getSong1 = songs.filter((song) => song.performer.includes(keyWord1));
      const getSong2 = songs.filter((song) => song.performer.includes(keyWord2));
      const arrSongs = [];

      for (const item in getSong) {
        arrSongs.push({
          id: getSong[item].id,
          title: getSong[item].title,
          performer: getSong[item].performer,
        });
      }
      for (const item in getSong1) {
        arrSongs.push({
          id: getSong1[item].id,
          title: getSong1[item].title,
          performer: getSong1[item].performer,
        });
      }
      for (const item in getSong2) {
        arrSongs.push({
          id: getSong2[item].id,
          title: getSong2[item].title,
          performer: getSong2[item].performer,
        });
      }
      return {
        status: 'success',
        data: {
          songs: arrSongs,
        }
      }
    } if (request.query.title && request.query.performer) {
      const { title, performer } = request.query;

      const keyTitle2 = title.charAt(0).toUpperCase() + title.slice(1);
      const keyPerformer2 = performer.charAt(0).toUpperCase() + performer.slice(1);

      const songs = await this._service.getSongs();

      const getSong = songs.filter((song) => song.performer.includes(keyPerformer2));
      const getSong2 = getSong.filter((song) => song.title.includes(keyTitle2));
      const arrSongs = [];

      for (const item in getSong2) {
        arrSongs.push({
          id: getSong2[item].id,
          title: getSong2[item].title,
          performer: getSong2[item].performer,
        });
      }
      return {
        status: 'success',
        data: {
          songs: arrSongs,
        }
      }
    }
    
    const songs = await this._service.getSongs();
    const arr = [];

    for (const item in songs) {
      arr.push({
        id: songs[item].id,
        title: songs[item].title,
        performer: songs[item].performer,
      });
    }

    return {
      status: 'success',
      data: {
        songs: arr,
      },
    };
  }

  async getSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const song = await this._service.getSongById(id);
      return {
        status: 'success',
        data: {
          song,
        },
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async putSongByIdHandler(request, h) {
    try {
      this._validator.validateSongPayload(request.payload);
      const { title, year, performer, genre, duration, albumId } = request.payload;
      const { id } = request.params;

      await this._service.editSongById(id, { title, year, performer, genre, duration, albumId });

      return {
        status: 'success',
        message: 'Song berhasil diperbarui',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }

  async deleteSongByIdHandler(request, h) {
    try {
      const { id } = request.params;
      await this._service.deleteSongById(id);

      return {
        status: 'success',
        message: 'Song berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        const response = h.response({
          status: 'fail',
          message: error.message,
        });
        response.code(error.statusCode);
        return response;
      }

      // Server ERROR!
      const response = h.response({
        status: 'error',
        message: 'Maaf, terjadi kegagalan pada server kami.',
      });
      response.code(500);
      console.error(error);
      return response;
    }
  }
}

module.exports = SongsHandler;
