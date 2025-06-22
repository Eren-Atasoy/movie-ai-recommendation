// TMDB API fonksiyonlarını import et
import { 
    getPopularMovies, 
    getMovieDetails, 
    searchMovies, 
    getMovieRecommendations, 
    getGenres, 
    getGenreNames, 
    getImageUrl 
} from './tmdb-api.js';

document.addEventListener('DOMContentLoaded', async function() {
    // DOM elementlerini seçme
    const searchInput = document.getElementById('film-search');
    const searchButton = document.getElementById('search-button');
    const recommendationsContainer = document.getElementById('recommendations-container');
    const popularMoviesContainer = document.querySelector('.bg-light .row');
    
    // Tüm film türlerini yükle
    let allGenres = [];
    try {
        allGenres = await getGenres();
    } catch (error) {
        console.error('Film türleri yüklenemedi:', error);
    }
    
    // Sayfa yüklendiğinde popüler filmleri göster
    loadPopularMovies();
    
    // Popüler filmleri yükleme fonksiyonu
    async function loadPopularMovies() {
        try {
            // Yükleniyor göstergesi
            popularMoviesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-3">Popüler filmler yükleniyor...</p>
                </div>
            `;
            
            // Popüler filmleri getir
            const movies = await getPopularMovies();
            
            if (movies && movies.length > 0) {
                let html = '';
                
                // İlk 5 filmi göster
                movies.slice(0, 5).forEach(movie => {
                    const genreNames = getGenreNames(movie.genre_ids, allGenres);
                    html += createMovieCard(movie, genreNames);
                });
                
                popularMoviesContainer.innerHTML = html;
            } else {
                popularMoviesContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-film fa-3x mb-3 text-muted"></i>
                        <h4>Film bulunamadı</h4>
                        <p>Şu anda popüler filmler yüklenemiyor.</p>
                    </div>
                `;
            }
        } catch (error) {
            console.error('Popüler filmler yüklenemedi:', error);
            popularMoviesContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                    <h4>Bir hata oluştu</h4>
                    <p>Popüler filmler yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
                </div>
            `;
        }
    }
    
    // Popüler filmler için film kartı HTML'i
    function createMovieCard(movie, genreNames) {
        const isLoggedIn = !!localStorage.getItem('authToken');
        const actionButtons = isLoggedIn ? 
            `<button class="btn btn-sm btn-outline-primary w-100" onclick="showMovieDetails(${movie.id})">Detaylar</button>` :
            `<button class="btn btn-sm btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="fas fa-lock me-1"></i> Giriş Yapın
            </button>`;
            
        return `
        <div class="col-md-15 col-sm-6 mb-4">
            <div class="card movie-card">
                <div class="card-img-top">
                    <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title} Afişi">
                </div>
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary"><i class="fas fa-star me-1"></i> ${movie.vote_average.toFixed(1)}</span>
                        <small class="text-muted">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</small>
                    </div>
                    <p class="card-text small">${genreNames.join(', ') || 'N/A'}</p>
                    ${actionButtons}
                </div>
            </div>
        </div>
        `;
    }
    
    // Arama butonuna tıklama olayı
    searchButton.addEventListener('click', function() {
        const query = searchInput.value.trim();
        if (query) {
            searchAndRecommend(query);
        }
    });
    
    // Enter tuşuna basma olayı
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const query = searchInput.value.trim();
            if (query) {
                searchAndRecommend(query);
            }
        }
    });
    
    // Film arama ve öneri fonksiyonu
    async function searchAndRecommend(query) {
        try {
            // Yükleniyor göstergesi
            recommendationsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-3">"${query}" için arama yapılıyor...</p>
                </div>
            `;
            
            // Filmleri ara
            const results = await searchMovies(query);
            
            if (!results || results.length === 0) {
                recommendationsContainer.innerHTML = `
                    <div class="col-12 text-center py-5">
                        <i class="fas fa-film fa-3x mb-3 text-muted"></i>
                        <h4>Üzgünüz, "${query}" için sonuç bulunamadı.</h4>
                        <p>Farklı bir arama terimi deneyin veya kategorilere göz atın.</p>
                    </div>
                `;
                return;
            }
            
            // İlk sonucu al
            const mainMovie = results[0];
            
            // Film detaylarını getir
            const movieDetails = await getMovieDetails(mainMovie.id);
            
            // Benzer filmleri getir
            const recommendations = await getMovieRecommendations(mainMovie.id);
            
            // Sonuçları göster
            displaySearchResults(movieDetails, recommendations.slice(0, 5));
            
        } catch (error) {
            console.error('Arama hatası:', error);
            recommendationsContainer.innerHTML = `
                <div class="col-12 text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                    <h4>Bir hata oluştu</h4>
                    <p>Film aranırken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
                </div>
            `;
        }
    }
    
    // Arama sonuçlarını gösterme
    function displaySearchResults(mainMovie, recommendations) {
        const isLoggedIn = !!localStorage.getItem('authToken');
        
        const actionButtons = isLoggedIn ? 
            `<button class="btn btn-primary">
                <i class="fas fa-play me-1"></i> İzle
            </button>
            <button class="btn btn-outline-secondary ms-2">
                <i class="fas fa-plus me-1"></i> Listeme Ekle
            </button>` :
            `<button class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="fas fa-lock me-1"></i> Giriş Yapın
            </button>`;
            
        let html = `
            <div class="col-12 mb-4">
                <div class="card">
                    <div class="row g-0">
                        <div class="col-md-4">
                            <img src="${getImageUrl(mainMovie.poster_path)}" 
                                 class="img-fluid rounded-start h-100 w-100" 
                                 style="object-fit: cover;" 
                                 alt="${mainMovie.title} Afişi">
                        </div>
                        <div class="col-md-8">
                            <div class="card-body">
                                <h3 class="card-title">${mainMovie.title} 
                                    <span class="badge bg-primary ms-2">
                                        <i class="fas fa-star me-1"></i> ${mainMovie.vote_average.toFixed(1)}
                                    </span>
                                </h3>
                                <p class="text-muted">
                                    ${mainMovie.release_date ? new Date(mainMovie.release_date).getFullYear() : 'N/A'} | 
                                    ${mainMovie.genres ? mainMovie.genres.map(g => g.name).join(', ') : 'N/A'}
                                </p>
                                <p class="card-text">${mainMovie.overview || 'Açıklama bulunmuyor.'}</p>
                                ${actionButtons}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-12 mb-3">
                <h4 class="section-title">Benzer Filmler</h4>
                <p class="text-muted mb-4 text-center">Yapay zeka, "${mainMovie.title}" filmine benzer şu filmleri önerdi:</p>
            </div>
        `;
        
        // Önerilen filmleri ekle
        recommendations.forEach(movie => {
            const genreNames = getGenreNames(movie.genre_ids, allGenres);
            
            const movieActionButtons = isLoggedIn ? 
                `<button class="btn btn-sm btn-outline-primary w-100" onclick="showMovieDetails(${movie.id})">Detaylar</button>` :
                `<button class="btn btn-sm btn-outline-primary w-100" data-bs-toggle="modal" data-bs-target="#loginModal">
                    <i class="fas fa-lock me-1"></i> Giriş Yapın
                </button>`;
                
            html += `
            <div class="col-md-15 col-sm-6 mb-4 recommendation-item">
                <div class="card movie-card">
                    <div class="card-img-top">
                        <img src="${getImageUrl(movie.poster_path)}" alt="${movie.title} Afişi">
                    </div>
                    <div class="card-body">
                        <h5 class="card-title">${movie.title}</h5>
                        <div class="d-flex justify-content-between align-items-center mb-2">
                            <span class="badge bg-primary"><i class="fas fa-star me-1"></i> ${movie.vote_average.toFixed(1)}</span>
                            <small class="text-muted">${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}</small>
                        </div>
                        <p class="card-text small">${genreNames.join(', ') || 'N/A'}</p>
                        ${movieActionButtons}
                    </div>
                </div>
            </div>
            `;
        });
        
        recommendationsContainer.innerHTML = html;
        
        // Animasyon için gecikme ekle
        const items = document.querySelectorAll('.recommendation-item');
        items.forEach((item, index) => {
            item.style.opacity = '0';
            setTimeout(() => {
                item.style.opacity = '1';
            }, 100 * index);
        });
    }
    
    // Film detayları için global fonksiyon
    window.showMovieDetails = async function(movieId) {
        try {
            const movie = await getMovieDetails(movieId);
            
            // Modal yerine şimdilik alert kullanıyoruz
            alert(`${movie.title} (${movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A'}) - ${movie.vote_average.toFixed(1)}/10\n\n${movie.overview || 'Açıklama bulunmuyor.'}`);
        } catch (error) {
            console.error('Film detayları yüklenemedi:', error);
            alert('Film detayları yüklenirken bir hata oluştu.');
        }
    };
    
    // Sayfa kaydırıldığında aktif navigasyon bağlantısını güncelle
    window.addEventListener('scroll', updateActiveNavLink);
    
    function updateActiveNavLink() {
        const sections = document.querySelectorAll('section, header.hero-section');
        const navLinks = document.querySelectorAll('.navbar-nav .nav-link');
        
        let currentSection = '';
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.clientHeight;
            
            if (pageYOffset >= (sectionTop - 100)) {
                currentSection = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === `#${currentSection}`) {
                link.classList.add('active');
            }
        });
    }
    
    // İlk yükleme için aktif bağlantıyı ayarla
    updateActiveNavLink();
    
    // Kimlik doğrulama değişikliklerini dinle
    window.addEventListener('storage', function(e) {
        if (e.key === 'authToken') {
            // Token değiştiğinde sayfayı yenile
            loadPopularMovies();
        }
    });
}); 