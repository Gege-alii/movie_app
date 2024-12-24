class MovieApp {
    constructor(apiKey) {
        this.apiKey = apiKey;
        this.apiUrl = 'https://api.themoviedb.org/3';
        this.movieList = $("#movie-list");
        this.movieListSection = $("#movie-list-section");
        this.movieDetailsSection = $("#movie-details-section");
        this.allMovies = [];

        this.initAuth();

        $(".nav-link").on("click", (e) => {
            const category = $(e.target).data("category");
            this.fetchMovies(category);
        });

        $("#back-btn").on("click", () => {
            this.showMovieList();
        });

        $("#login-btn").on("click", () => {
            this.showLoginModal(); 
        });

        $("#signup-btn").on("click", () => {
            this.showSignupModal(); 
        });

        $("#logout-btn").on("click", () => {
            this.logout(); 
        });

        // Listen for search input
        $("#movie-search").on("input", (e) => {
            this.searchMovies(e.target.value);
        });

        this.fetchMovies('popular');
    }

    initAuth() {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (loggedInUser) {
            $("#logout-btn").show();
        } else {
            $("#logout-btn").hide(); 
        }

        $("#signup-form").on("submit", (e) => {
            e.preventDefault();
            const email = $("#signup-email").val();
            const password = $("#signup-password").val();
            localStorage.setItem(email, password);
            Swal.fire({
                title: 'Sign-up successful!',
                text: 'Please log in.',
                icon: 'success',
                confirmButtonText: 'OK'
            });
            $("#signup-modal").modal("hide");
        });

        $("#login-form").on("submit", (e) => {
            e.preventDefault();
            const email = $("#login-email").val();
            const password = $("#login-password").val();
            const storedPassword = localStorage.getItem(email);

            if (storedPassword === password) {
                localStorage.setItem('loggedInUser', email);
                Swal.fire({
                    title: 'Login successful!',
                    text: 'Welcome back!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                });
                $("#login-modal").modal("hide");
                this.fetchMovies('popular'); 
                this.updateLoginState(); 
            } else {
                Swal.fire({
                    title: 'Error!',
                    text: 'Invalid email or password!',
                    icon: 'error',
                    confirmButtonText: 'OK'
                });
            }
        });
    }

    updateLoginState() {
        $("#logout-btn").show();
    }

    logout() {
        localStorage.removeItem('loggedInUser');
        $("#logout-btn").hide(); 
        Swal.fire({
            title: 'Logged out',
            text: 'You have logged out successfully!',
            icon: 'success',
            confirmButtonText: 'OK'
        });
        this.fetchMovies('popular'); 
    }

    async fetchMovies(category) {
        try {
            const response = await fetch(`${this.apiUrl}/movie/${category}?api_key=${this.apiKey}`);
            const data = await response.json();
            this.allMovies = data.results; 
            this.displayMovies(this.allMovies);
        } catch (error) {
            console.error("Error fetching movies:", error);
        }
    }

    displayMovies(movies) {
        this.movieList.empty();

        movies.forEach((movie) => {
            const movieHtml = `
                <div class="col-md-4">
                    <div class="card movie-card">
                        <img src="https://image.tmdb.org/t/p/w500/${movie.poster_path}" class="card-img-top" alt="${movie.title}">
                        <div class="card-body">
                            <h5 class="card-title">${movie.title}</h5>
                            <p class="card-text">${movie.overview.substring(0, 100)}...</p>
                            <button class="btn btn-dark" onclick="app.showMovieDetails(${movie.id})">View Details</button>
                        </div>
                    </div>
                </div>
            `;
            this.movieList.append(movieHtml);
        });

        this.showMovieList();
    }

    searchMovies(query) {
        const filteredMovies = this.allMovies.filter(movie => 
            movie.title.toLowerCase().includes(query.toLowerCase()) ||
            movie.overview.toLowerCase().includes(query.toLowerCase())
        );
    
        this.displayMovies(filteredMovies);
        if (query && filteredMovies.length === 0) {
            $("#error-message")
                .removeClass("d-none")  
                .addClass("animate__animated animate__fadeIn");  
        } else {
            $("#error-message")
                .addClass("d-none")  
                .removeClass("animate__fadeIn");  
        }
    }
    

    async showMovieDetails(movieId) {
        const loggedInUser = localStorage.getItem('loggedInUser');
        if (!loggedInUser) {
            Swal.fire({
                title: 'Please log in first',
                text: 'You need to log in to view movie details.',
                icon: 'warning',
                confirmButtonText: 'OK',
                preConfirm: () => {
                    this.showLoginModal(); 
                }
            });
            return; 
        }

        // fetch movie details if logged in
        try {
            const response = await fetch(`${this.apiUrl}/movie/${movieId}?api_key=${this.apiKey}`);
            const movie = await response.json();

            $("#movie-poster").attr("src", `https://image.tmdb.org/t/p/w500/${movie.poster_path}`);
            $("#movie-title").text(movie.title);
            $("#release-date").text(movie.release_date);
            $("#rating").text(movie.vote_average);
            $("#movie-overview").text(movie.overview);

            this.showMovieDetailsSection();
        } catch (error) {
            console.error("Error fetching movie details:", error);
        }
    }

    showMovieList() {
        this.movieDetailsSection.hide();
        this.movieListSection.show();
    }

    showMovieDetailsSection() {
        this.movieListSection.hide();
        this.movieDetailsSection.show();
    }

    showLoginModal() {
        $("#login-modal").modal("show");
    }

    showSignupModal() {
        $("#signup-modal").modal("show");
    }
}

const app = new MovieApp('1efe754467e6e97a0609493d65014d7f');
