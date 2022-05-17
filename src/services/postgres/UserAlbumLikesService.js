const {Pool} = require('pg');
const InvariantError = require('../../exceptions/InvariantError');
const {nanoid} = require('nanoid');

class UserAlbumLikesService {
  constructor(cacheService) {
    this._pool = new Pool();
    this._cacheService = cacheService;
  }

  async addLikeInAlbum(userId, albumId) {
    const id = `user-album-likes-${nanoid(16)}`;
    const query = {
      text: 'INSERT INTO user_album_likes VALUES ($1, $2, $3) returning id',
      values: [id, userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows[0].id) {
      throw new InvariantError('Like Gagal dilakukan');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
    return result.rows[0].id;
  }

  async deleteLikeInAlbum(userId, albumId) {
    const query = {
      text: `DELETE FROM user_album_likes WHERE user_id = $1 AND album_id = $2 returning id`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    if (!result.rows.length) {
      throw new InvariantError('Gagal melakukan unlike');
    }

    await this._cacheService.delete(`user_album_likes:${albumId}`);
  }

  async isLikeExist(userId, albumId) {
    const query = {
      text: `SELECT * FROM user_album_likes WHERE user_id = $1 AND album_id = $2`,
      values: [userId, albumId],
    };

    const result = await this._pool.query(query);

    return result.rows.length;
  }

  async getLikesCount(albumId) {
    try {
      const result = await this._cacheService.get(`user_album_likes:${albumId}`);

      return {
        source: 'cache',
        count: JSON.parse(result),
      };
    } catch (error) {
      const query = {
        text: `SELECT * FROM user_album_likes WHERE album_id = $1`,
        values: [albumId],
      };

      const result = await this._pool.query(query);
      if (!result.rows.length) {
        throw new InvariantError('Album belum memiliki like');
      }
      await this._cacheService.set(`user_album_likes:${albumId}`, JSON.stringify(result.rows.length));

      return {
        count: result.rows.length,
      };
    }
  }
}
module.exports = UserAlbumLikesService;
