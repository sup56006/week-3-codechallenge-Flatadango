document.addEventListener("DOMContentLoaded", () => {
  const filmsList = document.getElementById("films");
  const posterEl = document.getElementById("movie-poster");
  const titleEl = document.getElementById("movie-title");
  const runtimeEl = document.getElementById("movie-runtime");
  const showtimeEl = document.getElementById("movie-showtime");
  const descEl = document.getElementById("movie-description");
  const directorEl = document.getElementById("movie-director");
  const writersEl = document.getElementById("movie-writers");
  const castEl = document.getElementById("movie-cast");
  const yearEl = document.getElementById("movie-year");
  const availableEl = document.getElementById("movie-available");
  const buyBtn = document.getElementById("buy-ticket-btn");
  
  let currentFilm = null;
  
  function fetchFilms() {
    fetch('http://localhost:3000/films')
      .then(res => res.json())
      .then(films => {
        filmsList.innerHTML = '';
        films.forEach(film => {
          const li = document.createElement('li');
          li.classList.add('film', 'item');
          li.textContent = film.title;
          li.addEventListener('click', () => {
            showFilmDetails(film.id);
          });
          filmsList.appendChild(li);
        });
      })
      .catch(err => console.error("Error fetching films:", err));
  }
  
  function showFilmDetails(filmId) {
    fetch(`http://localhost:3000/films/${filmId}`)
      .then(res => res.json())
      .then(film => {
        currentFilm = film;
        posterEl.src = film.poster;
        titleEl.textContent = film.title;
        runtimeEl.textContent = film.runtime;
        showtimeEl.textContent = film.showtime;
        descEl.textContent = film.description;
        directorEl.textContent = film.director.join(', ');
        writersEl.textContent = film.writers.join(', ');
        castEl.textContent = film.cast.join(', ');
        yearEl.textContent = film.release_year;
        
        const availableTickets = film.capacity - film.tickets_sold;
        availableEl.textContent = availableTickets;
        if (availableTickets > 0) {
          buyBtn.textContent = "Buy Ticket";
          buyBtn.disabled = false;
        } else {
          buyBtn.textContent = "Sold Out";
          buyBtn.disabled = true;
        }
      })
      .catch(err => console.error("Error fetching film details:", err));
  }
  
  buyBtn.addEventListener('click', () => {
    if (!currentFilm) return;
    const available = currentFilm.capacity - currentFilm.tickets_sold;
    if (available > 0) {
      const newTicketsSold = currentFilm.tickets_sold + 1;
      
      // PATCH to update tickets_sold
      fetch(`http://localhost:3000/films/${currentFilm.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tickets_sold: newTicketsSold
        })
      })
      .then(res => res.json())
      .then(updatedFilm => {
        currentFilm = updatedFilm;
        const newAvailable = updatedFilm.capacity - updatedFilm.tickets_sold;
        availableEl.textContent = newAvailable;
        if (newAvailable <= 0) {
          buyBtn.textContent = "Sold Out";
          buyBtn.disabled = true;
        }
      })
      .catch(err => console.error("Error purchasing ticket:", err));
    }
  });
  
  // Initial load
  fetchFilms();
  // Show the first film by default
  fetch('http://localhost:3000/films/1')
    .then(res => res.json())
    .then(film => {
      showFilmDetails(film.id);
    });
});
