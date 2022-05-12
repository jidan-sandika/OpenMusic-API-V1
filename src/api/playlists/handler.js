/* eslint-disable no-underscore-dangle */
const ClientError = require('../../exceptions/ClientError');

class PlaylistsHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;

    this.postPlaylistHandler = this.postPlaylistHandler.bind(this);
    this.getPlaylistsHandler = this.getPlaylistsHandler.bind(this);
    this.deletePlaylistByIdHandler = this.deletePlaylistByIdHandler.bind(this);
    this.postSongToPlaylistHandler = this.postSongToPlaylistHandler.bind(this);
    this.getSongInPlaylistHandler = this.getSongInPlaylistHandler.bind(this);
    this.deleteSongInPlaylistHandler = this.deleteSongInPlaylistHandler.bind(this);
  }

  async postPlaylistHandler(request, h) {
    try {
      this._validator.validatePlaylistPayload(request.payload);
      const { name, } = request.payload;
      const { id: credentialId } = request.auth.credentials;

      const playlistId = await this._service.addPlaylist({
        name, owner: credentialId,
      });

      const response = h.response({
        status: 'success',
        message: 'Playlist berhasil ditambahkan',
        data: {
          playlistId,
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

  async getPlaylistsHandler(request) {
    const { id: credentialId } = request.auth.credentials;
    const playlists = await this._service.getPlaylists(credentialId);
    return {
      status: 'success',
      data: {
        playlists,
      },
    };
  }

  async deletePlaylistByIdHandler(request, h) {
    try {
      const { id: playlist_id } = request.params;
      const { id: credentialId } = request.auth.credentials;

      await this._service.verifyPlaylistOwner(playlist_id, credentialId);
      await this._service.deletePlaylistById(playlist_id);

      return {
        status: 'success',
        message: 'Playlist berhasil dihapus',
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

  async postSongToPlaylistHandler(request, h) {
    try {
      const { id: playlist_id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;

      this._validator.validateAddSongToPlaylistPayload(request.payload);
      await this._service.verifyPlaylistOwner(playlist_id, credentialId);
      await this._service.addSongToPlaylist( playlist_id, songId );

      const response = h.response({
        status: 'success',
        message: 'Song berhasil ditambahkan ke playlist',
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

  async getSongInPlaylistHandler(request, h) {
    try {
      
      const { id: credentialId } = request.auth.credentials;
      const { id: playlist_id } = request.params;
      await this._service.verifyPlaylistOwner(playlist_id, credentialId);
  
      const playlist = await this._service.getSongInPlaylist(playlist_id);
      return {
        status: 'success',
        data: {
          playlist,
        }
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

  async deleteSongInPlaylistHandler(request, h) {
    
    try {
      this._validator.validateAddSongToPlaylistPayload(request.payload);

      const { id: playlist_id } = request.params;
      const { id: credentialId } = request.auth.credentials;
      const { songId } = request.payload;
      
      await this._service.verifyPlaylistOwner(playlist_id, credentialId);
      await this._service.deleteSongInPlaylist(playlist_id, songId);

      return {
        status: 'success',
        message: 'Song di dalam playlist berhasil dihapus',
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

module.exports = PlaylistsHandler;