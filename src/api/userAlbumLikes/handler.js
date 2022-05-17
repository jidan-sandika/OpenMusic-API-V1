const ClientError = require('../../exceptions/ClientError');

class UserAlbumLikesHandler {
  constructor(service, albumsService) {
    this._service = service;
    this._albumsService = albumsService;

    this.postLikeHandler = this.postLikeHandler.bind(this);
    this.getLikeHandler = this.getLikeHandler.bind(this);
  }

  async postLikeHandler(request, h) {
    try {
      const {id: albumId} = request.params;
      const {id: credentialId} = request.auth.credentials;

      await this._albumsService.getAlbumById(albumId);

      const isLikeExist = await this._service.isLikeExist(credentialId, albumId);

      if (!isLikeExist) {
        const likeId = await this._service.addLikeInAlbum(credentialId, albumId);

        const response = h.response({
          status: 'success',
          message: `Berhasil like pada album id: ${likeId}`,
        });
        response.code(201);
        return response;
      }

      await this._service.deleteLikeInAlbum(credentialId, albumId);

      const response = h.response({
        status: 'success',
        message: 'Berhasil melakukan unlike',
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

  async getLikeHandler(request, h) {
    try {
      const {id: albumId} = request.params;

      const like = await this._service.getLikesCount(albumId);
      const likesCount = like.count;

      const response = h.response({
        status: 'success',
        data: {
          likes: likesCount,
        },
      });
      response.header('X-Data-Source', like.source).code(200);
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
}

module.exports = UserAlbumLikesHandler;
