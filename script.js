const apiKey = '77c4e2b070a2e1396500d0b42ebf7cec';
const baseUrl = 'https://api.themoviedb.org/3';
const imgBaseUrl = 'https://image.tmdb.org/t/p/w500';

const genreFilter = document.getElementById('genreFilter');
const searchInput = document.getElementById('searchInput');
const moviesContainer = document.getElementById('moviesContainer');

let genres = {};
let allMovies = [];

async function fetchGenres() {
  const res = await fetch(`${baseUrl}/genre/movie/list?api_key=${apiKey}&language=pt-BR`);
  const data = await res.json();
  genres = data.genres.reduce((acc, genre) => {
    acc[genre.id] = genre.name;
    return acc;
  }, {});

  data.genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre.id;
    option.textContent = genre.name;
    genreFilter.appendChild(option);
  });
}

async function fetchAllPopularMovies(pages = 5) {
  const promises = [];
  for (let i = 1; i <= pages; i++) {
    promises.push(fetch(`${baseUrl}/movie/popular?api_key=${apiKey}&language=pt-BR&page=${i}`).then(res => res.json()));
  }
  const results = await Promise.all(promises);
  allMovies = results.flatMap(result => result.results);
  renderMovies();
}

function renderMovies() {
  moviesContainer.innerHTML = '';

  const selectedGenre = genreFilter.value;
  const searchTerm = searchInput.value.toLowerCase();

  const filtered = allMovies.filter(movie => {
    const matchesGenre = selectedGenre === 'all' || movie.genre_ids.includes(Number(selectedGenre));
    const matchesSearch = movie.title.toLowerCase().includes(searchTerm);
    return matchesGenre && matchesSearch;
  });

  const moviesByGenre = {};

  filtered.forEach(movie => {
    movie.genre_ids.forEach(id => {
      if (!moviesByGenre[id]) moviesByGenre[id] = [];
      moviesByGenre[id].push(movie);
    });
  });

  Object.keys(moviesByGenre).forEach(genreId => {
    const section = document.createElement('div');
    section.classList.add('genre-section');

    const title = document.createElement('h2');
    title.classList.add('genre-title');
    title.textContent = genres[genreId];
    section.appendChild(title);

    const carousel = document.createElement('div');
    carousel.classList.add('movie-carousel');

    moviesByGenre[genreId].forEach(movie => {
      const card = document.createElement('div');
      card.classList.add('movie-card');

      const img = document.createElement('img');
      img.src = movie.poster_path ? imgBaseUrl + movie.poster_path : '';
      img.alt = movie.title;

      const movieTitle = document.createElement('div');
      movieTitle.classList.add('movie-title');
      movieTitle.textContent = movie.title;

      card.appendChild(img);
      card.appendChild(movieTitle);
      carousel.appendChild(card);
    });

    section.appendChild(carousel);
    moviesContainer.appendChild(section);
  });

  activateScrollFix();
}

function activateScrollFix() {
  document.querySelectorAll('.movie-carousel').forEach(carousel => {
    carousel.addEventListener('wheel', (e) => {
      e.preventDefault();
      carousel.scrollLeft += e.deltaY;
    });
  });
}

genreFilter.addEventListener('change', renderMovies);
searchInput.addEventListener('input', renderMovies);

(async () => {
  await fetchGenres();
  await fetchAllPopularMovies(5); // puxa os 5 primeiros pages
})();
