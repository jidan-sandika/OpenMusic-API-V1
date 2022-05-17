const ClientError = require('../../exceptions/ClientError');

class UploadsHandler {
  constructor(service, validator, albumsService) {
    this._service = service;
    this._validator = validator;
    this._albumsService = albumsService;

    this.postAlbumCoverHandler = this.postAlbumCoverHandler.bind(this);
  }

  async postAlbumCoverHandler(request, h) {
    try {
      const {cover} = request.payload;
      const {id: albumId} = request.params;

      this._validator.validateImageHeaders(cover.hapi.headers);

      const filename = await this._service.writeFile(cover, cover.hapi);
      const coverUrl = `http://${process.env.HOST}:${process.env.PORT}/upload/images/${filename}`;

      await this._albumsService.addCoverAlbumById(albumId, coverUrl);
      const response = h.response({
        status: 'success',
        message: 'Sampul berhasil diunggah',
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
      console.log(error);
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

module.exports = UploadsHandler;