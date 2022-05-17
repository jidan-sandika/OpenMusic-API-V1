require('dotenv').config();

const Hapi = require('@hapi/hapi');
const Jwt = require('@hapi/jwt');
const TokenManager = require('./tokenize/TokenManager');
const path = require('path');
const Inert = require('@hapi/inert');

// plugins
const albums = require('./api/albums');
const songs = require('./api/songs');
const users = require('./api/users');
const authentications = require('./api/authentications');
const playlists = require('./api/playlists');
const _exports = require('./api/exports');
const uploads = require('./api/uploads');
const userAlbumLikes = require('./api/userAlbumLikes');
const collaborations = require('./api/collaborations');

// services
const AlbumsService = require('./services/postgres/AlbumsService');
const SongsService = require('./services/postgres/SongsService');
const UsersService = require('./services/postgres/UsersService');
const AuthenticationsService = require('./services/postgres/AuthenticationsService');
const PlaylistsService = require('./services/postgres/PlaylistsService');
const ProducerService = require('./services/rabbitmq/ProducerService');
const StorageService = require('./services/storage/StorageService');
const UserAlbumLikesService = require('./services/postgres/UserAlbumLikesService');
const CacheService = require('./services/redis/CacheService');
const CollaborationsService = require('./services/postgres/CollaborationsService');

// validators
const AlbumsValidator = require('./validator/albums');
const SongsValidator = require('./validator/songs');
const UsersValidator = require('./validator/users');
const AuthenticationsValidator = require('./validator/authentications');
const PlaylistsValidator = require('./validator/playlists');
const ExportsValidator = require('./validator/exports');
const UploadsValidator = require('./validator/uploads');
const CollaborationsValidator = require('./validator/collaborations');

const init = async () => {
  
  const cacheService = new CacheService();
  const collaborationsService = new CollaborationsService();
  const albumsService = new AlbumsService();
  const songsService = new SongsService();
  const usersService = new UsersService();
  const authenticationsService = new AuthenticationsService();
  const playlistsService = new PlaylistsService(collaborationsService);
  const storageService = new StorageService(path.resolve(__dirname, 'api/uploads/file/images'));
  const userAlbumLikesService = new UserAlbumLikesService(cacheService);

  const server = Hapi.server({
    port: process.env.PORT,
    host: process.env.HOST,
    routes: {
      cors: {
        origin: ['*'],
      },
    },
  });

    // registrasi plugin eksternal
    await server.register([
      {
        plugin: Jwt,
      },
      {
        plugin: Inert,
      },
    ]);

    // mendefinisikan strategy autentikasi jwt
  server.auth.strategy('openmusicapp_jwt', 'jwt', {
    keys: process.env.ACCESS_TOKEN_KEY,
    verify: {
      aud: false,
      iss: false,
      sub: false,
      maxAgeSec: process.env.ACCESS_TOKEN_AGE,
    },
    validate: (artifacts) => ({
      isValid: true,
      credentials: {
        id: artifacts.decoded.payload.id,
      },
    }),
  });

  const plugins = [{
      plugin: albums,
      options: {
        service: albumsService,
        validator: AlbumsValidator
      }
    },
    {
      plugin: songs,
      options: {
        service: songsService,
        validator: SongsValidator
      }
    },
    {
      plugin: users,
      options: {
        service: usersService,
        validator: UsersValidator
      }
    },
    {
      plugin: authentications,
      options: {
        authenticationsService,
        usersService,
        tokenManager: TokenManager,
        validator: AuthenticationsValidator,
      },
    },
    {
      plugin: playlists,
      options: {
        service: playlistsService,
        validator: PlaylistsValidator,
      },
    },
    {
      plugin: _exports,
      options: {
        service: ProducerService,
        validator: ExportsValidator,
        playlistsService,
      },
    },
    {
      plugin: uploads,
      options: {
        service: storageService,
        validator: UploadsValidator,
        albumsService,
      }
    },
    {
      plugin: userAlbumLikes,
      options: {
        service: userAlbumLikesService,
        albumsService,
      }
    },
    {
      plugin: collaborations,
      options: {
        service: collaborationsService,
        validator: CollaborationsValidator,
        playlistsService,
      }
    }
  ];

  await server.register(plugins);

  await server.start();
  console.log(`Server sedang berjalan pada ${server.info.uri}`);
};

init();
