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
    
  module.exports = { mapDBToModel, mapDBToModel2 };