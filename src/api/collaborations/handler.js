const ClientError = require('../../exceptions/ClientError');

class CollaborationsHandler {
  constructor(service, validator, playlistsService,) {
    this._service = service;
    this._validator = validator;
    this._playlistsService = playlistsService;

    this.postCollaborationHandler = this.postCollaborationHandler.bind(this);
    this.deleteCollaborationHandler = this.deleteCollaborationHandler.bind(this);
  }

  async postCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);

      const collaborationId = await this._service.addCollaboration(playlistId, userId);

      return h.response({
        status: 'success',
        message: 'Collaborations berhasil ditambahkan',
        data: {
          collaborationId,
        },
      }).code(201);
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }
      
      return h.response({
        status: 'error',
        message: error.message,
      }).code(500);
    }
  }

  async deleteCollaborationHandler(request, h) {
    try {
      this._validator.validateCollaborationPayload(request.payload);

      const { id: credentialId } = request.auth.credentials;
      const { playlistId, userId } = request.payload;

      await this._playlistsService.verifyPlaylistOwner(playlistId, credentialId);
      await this._service.deleteCollaboration(playlistId, userId);

      return {
        status: 'success',
        message: 'Kolaborasi berhasil dihapus',
      };
    } catch (error) {
      if (error instanceof ClientError) {
        return h.response({
          status: 'fail',
          message: error.message,
        }).code(error.statusCode);
      }
      
      return h.response({
        status: 'error',
        message: error.message,
      }).code(500);
    }
  }
}

module.exports = CollaborationsHandler;
