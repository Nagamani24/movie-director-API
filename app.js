const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");
let db = null;
const initializeDbAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server is Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error :${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertToPascalCase = (each) => {
  return {
    movieId: each.movie_id,
    directorId: each.director_id,
    movieName: each.movie_name,
    leadActor: each.lead_actor,
  };
};

convertDirectorTable = (each) => {
  return {
    directorId: each.director_id,
    directorName: each.director_name,
  };
};

//API 1

app.get("/movies/", async (request, response) => {
  const listOfMoviesQuery = `SELECT movie_name
                                  FROM movie`;
  const listOfMovies = await db.all(listOfMoviesQuery);
  response.send(
    listOfMovies.map((eachMovie) => convertToPascalCase(eachMovie))
  );
});

//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  console.log(movieName);
  const createMovieQuery = `INSERT INTO movie(director_id,movie_name,lead_actor)
                                VALUES (${directorId},'${movieName}','${leadActor}')
                                `;
  const newMovie = await db.run(createMovieQuery);

  response.send("Movie Successfully Added");
});

//API 3

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;

  const getMovieQuery = `SELECT *
                        FROM movie
                        WHERE movie_id = ${movieId};`;
  const getMovie = await db.get(getMovieQuery);
  response.send({
    movieId: getMovie.movie_id,
    directorId: getMovie.director_id,
    movieName: getMovie.movie_name,
    leadActor: getMovie.lead_actor,
  });
});

//API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie
                                SET director_id = ${directorId},
                                movie_name = '${movieName}',
                                lead_actor = '${leadActor}'
                                WHERE movie_id = ${movieId};`;
  const updatedMovie = await db.run(updateMovieQuery);

  response.send("Movie Details Updated");
});

//API 5
app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie
                                WHERE movie_id = ${movieId};`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//API 6

app.get("/directors/", async (request, response) => {
  const listOfDirectorsQuery = `SELECT *
                                    FROM director`;
  const listOfDirectors = await db.all(listOfDirectorsQuery);
  response.send(listOfDirectors.map((each) => convertDirectorTable(each)));
});

//API 7
app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const directorMovieQuery = `SELECT movie_name
                                FROM movie Natural Join director
                                WHERE director_id = ${directorId};`;
  const directorMovies = await db.all(directorMovieQuery);
  console.log(directorMovies);
  response.send(
    directorMovies.map((each) => {
      return {
        movieName: each.movie_name,
      };
    })
  );
});

module.exports = app;
