/* eslint-disable linebreak-style */
/* eslint-disable camelcase */
const mapDBToModel = ({
    id,
    name,
    year,
  }) => ({
    id,
    name,
    year,
    });

const mapDBToModel2 = ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
  }) => ({
    id,
    title,
    year,
    performer,
    genre,
    duration,
    albumId,
    });
    
const mapDBToModel3 = ({
      id,
      name,
      username,
    }) => ({
      id,
      name,
      username,
      });
    
  module.exports = { mapDBToModel, mapDBToModel2, mapDBToModel3 };