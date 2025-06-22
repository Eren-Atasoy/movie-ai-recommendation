// TMDB API URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcının giriş yapmış olduğunu kontrol et
    checkAuthentication();
    
    // Profil bilgilerini yükle
    loadProfileData();
    
    // Favori filmleri yükle
    loadFavorites();
    
    // Arama olayını dinle
    const searchInput = document.getElementById('search-favorites');
    const searchButton = document.getElementById('search-favorites-btn');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function() {
            searchFavorites(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchFavorites(searchInput.value);
            }
        });
    }
    
    // Filtreleme olayını dinle
    const filterSelect = document.getElementById('filter-favorites');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterFavorites(this.value);
        });
    }
    
    // Çıkış butonu olayı
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
});

// Kullanıcının giriş yapmış olduğunu kontrol et
function checkAuthentication() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        // Kullanıcı giriş yapmamışsa ana sayfaya yönlendir
        window.location.href = 'index.html';
        return;
    }
    
    // Token geçerliliğini kontrol et (basit bir kontrol)
    try {
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            // Geçersiz token formatı
            logout();
            return;
        }
        
        // Token'ın süresini kontrol et
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiry = payload.exp * 1000; // milisaniyeye çevir
        
        if (Date.now() >= expiry) {
            // Token süresi dolmuş
            logout();
            return;
        }
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        logout();
    }
}

// Profil bilgilerini yükle
function loadProfileData() {
    try {
        // LocalStorage'dan kullanıcı bilgilerini al
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
            return;
        }
        
        const userData = JSON.parse(userDataStr);
        
        // Profil başlık bilgilerini güncelle
        document.getElementById('profile-username').textContent = userData.username || 'Kullanıcı Adı';
        document.getElementById('profile-email').textContent = userData.email || 'kullanici@ornek.com';
        document.getElementById('profile-join-date').textContent = userData.joinDate || 'Ocak 2023';
        
    } catch (error) {
        console.error('Profil bilgileri yüklenirken hata oluştu:', error);
    }
}

// Favori filmleri yükle
async function loadFavorites() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Yükleniyor göstergesi
        const favoritesContainer = document.getElementById('favorites-container');
        favoritesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <div class="spinner-border text-primary" role="status"></div>
                <p class="mt-3">Favori filmleriniz yükleniyor...</p>
            </div>
        `;
        
        // API'den favori filmleri al
        // Gerçek API entegrasyonu olmadığı için örnek veriler kullanıyoruz
        // Gerçek bir API entegrasyonu olduğunda bu kısım değiştirilmelidir
        
        // Simüle edilmiş API yanıtı
        const favoriteMovies = [
            {
                id: 1,
                title: "Inception",
                poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                vote_average: 8.4,
                release_date: "2010-07-16",
                genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
                dateAdded: "2023-06-15"
            },
            {
                id: 2,
                title: "The Shawshank Redemption",
                poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                vote_average: 8.7,
                release_date: "1994-09-23",
                genres: ["Drama", "Suç"],
                dateAdded: "2023-06-10"
            },
            {
                id: 3,
                title: "The Dark Knight",
                poster_path: "/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg",
                vote_average: 8.5,
                release_date: "2008-07-18",
                genres: ["Aksiyon", "Suç", "Gerilim"],
                dateAdded: "2023-06-05"
            },
            {
                id: 4,
                title: "Pulp Fiction",
                poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                vote_average: 8.5,
                release_date: "1994-10-14",
                genres: ["Suç", "Gerilim"],
                dateAdded: "2023-05-20"
            },
            {
                id: 5,
                title: "The Lord of the Rings: The Return of the King",
                poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
                vote_average: 8.5,
                release_date: "2003-12-17",
                genres: ["Macera", "Fantastik", "Aksiyon"],
                dateAdded: "2023-05-15"
            },
            {
                id: 6,
                title: "Fight Club",
                poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                vote_average: 8.4,
                release_date: "1999-10-15",
                genres: ["Drama", "Gerilim"],
                dateAdded: "2023-05-10"
            }
        ];
        
        // Favori film sayısını güncelle
        document.getElementById('favorites-count').textContent = `${favoriteMovies.length} Film`;
        
        // Favori filmleri göster veya "favori film yok" mesajını göster
        if (favoriteMovies.length === 0) {
            document.getElementById('no-favorites-alert').classList.remove('d-none');
            favoritesContainer.innerHTML = '';
        } else {
            document.getElementById('no-favorites-alert').classList.add('d-none');
            renderFavoriteMovies(favoriteMovies);
        }
        
    } catch (error) {
        console.error('Favori filmler yüklenirken hata oluştu:', error);
        
        const favoritesContainer = document.getElementById('favorites-container');
        favoritesContainer.innerHTML = `
            <div class="col-12 text-center py-5">
                <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                <h4>Bir hata oluştu</h4>
                <p>Favori filmleriniz yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
            </div>
        `;
    }
}

// Favori filmleri ekrana render et
function renderFavoriteMovies(movies) {
    const favoritesContainer = document.getElementById('favorites-container');
    
    let html = '';
    
    movies.forEach(movie => {
        const releaseYear = movie.release_date ? new Date(movie.release_date).getFullYear() : 'N/A';
        const posterUrl = movie.poster_path ? `${TMDB_IMAGE_URL}${movie.poster_path}` : 'https://via.placeholder.com/300x450?text=Film+Afişi';
        
        html += `
        <div class="col-md-4 col-sm-6 mb-4" data-movie-id="${movie.id}">
            <div class="card movie-card">
                <div class="card-img-top">
                    <img src="${posterUrl}" alt="${movie.title}">
                    <button class="favorite-badge" title="Favorilerden Çıkar" onclick="removeFromFavorites(${movie.id})">
                        <i class="fas fa-heart"></i>
                    </button>
                </div>
                <div class="card-body">
                    <h5 class="card-title">${movie.title}</h5>
                    <div class="d-flex justify-content-between align-items-center mb-2">
                        <span class="badge bg-primary"><i class="fas fa-star me-1"></i> ${movie.vote_average.toFixed(1)}</span>
                        <small class="text-muted">${releaseYear}</small>
                    </div>
                    <p class="card-text small">${movie.genres.join(', ')}</p>
                    <button class="btn btn-sm btn-outline-primary w-100" onclick="showMovieDetails(${movie.id})">Detaylar</button>
                </div>
            </div>
        </div>
        `;
    });
    
    favoritesContainer.innerHTML = html;
}

// Favori filmleri ara
function searchFavorites(query) {
    if (!query) {
        loadFavorites();
        return;
    }
    
    query = query.toLowerCase();
    
    // Tüm film kartlarını seç
    const movieCards = document.querySelectorAll('#favorites-container .col-md-4');
    
    movieCards.forEach(card => {
        const title = card.querySelector('.card-title').textContent.toLowerCase();
        const genres = card.querySelector('.card-text').textContent.toLowerCase();
        
        if (title.includes(query) || genres.includes(query)) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Görünür film sayısını güncelle
    const visibleMovies = document.querySelectorAll('#favorites-container .col-md-4[style=""]').length;
    document.getElementById('favorites-count').textContent = `${visibleMovies} Film`;
    
    // Hiç sonuç yoksa mesaj göster
    if (visibleMovies === 0) {
        const favoritesContainer = document.getElementById('favorites-container');
        favoritesContainer.innerHTML += `
            <div class="col-12 text-center py-5">
                <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                <h4>Sonuç bulunamadı</h4>
                <p>"${query}" için favori film bulunamadı.</p>
            </div>
        `;
    }
}

// Favori filmleri filtrele
function filterFavorites(filterValue) {
    // Tüm film kartlarını seç
    const movieCards = Array.from(document.querySelectorAll('#favorites-container .col-md-4'));
    
    if (movieCards.length === 0) return;
    
    // Filtreleme değerine göre sırala
    switch (filterValue) {
        case 'date-added-desc':
            // En son eklenen en üstte (varsayılan)
            // Burada gerçek bir API entegrasyonu olduğunda tarihe göre sıralama yapılacak
            break;
            
        case 'date-added-asc':
            // En eski eklenen en üstte
            movieCards.reverse();
            break;
            
        case 'rating-desc':
            // En yüksek puanlı en üstte
            movieCards.sort((a, b) => {
                const ratingA = parseFloat(a.querySelector('.badge').textContent.replace(/[^\d.]/g, ''));
                const ratingB = parseFloat(b.querySelector('.badge').textContent.replace(/[^\d.]/g, ''));
                return ratingB - ratingA;
            });
            break;
            
        case 'rating-asc':
            // En düşük puanlı en üstte
            movieCards.sort((a, b) => {
                const ratingA = parseFloat(a.querySelector('.badge').textContent.replace(/[^\d.]/g, ''));
                const ratingB = parseFloat(b.querySelector('.badge').textContent.replace(/[^\d.]/g, ''));
                return ratingA - ratingB;
            });
            break;
            
        case 'title-asc':
            // A-Z sıralaması
            movieCards.sort((a, b) => {
                const titleA = a.querySelector('.card-title').textContent;
                const titleB = b.querySelector('.card-title').textContent;
                return titleA.localeCompare(titleB);
            });
            break;
            
        case 'title-desc':
            // Z-A sıralaması
            movieCards.sort((a, b) => {
                const titleA = a.querySelector('.card-title').textContent;
                const titleB = b.querySelector('.card-title').textContent;
                return titleB.localeCompare(titleA);
            });
            break;
    }
    
    // Sıralanmış kartları tekrar ekle
    const favoritesContainer = document.getElementById('favorites-container');
    favoritesContainer.innerHTML = '';
    
    movieCards.forEach(card => {
        favoritesContainer.appendChild(card);
    });
}

// Favorilerden çıkar
function removeFromFavorites(movieId) {
    try {
        const token = localStorage.getItem('authToken');
        
        // API isteği (gerçek API entegrasyonu olmadığı için simüle ediyoruz)
        // Gerçek bir API entegrasyonu olduğunda bu kısım değiştirilmelidir
        /*
        const response = await fetch(`${API_BASE_URL}/auth/favorites/${movieId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Film favorilerden çıkarılırken bir hata oluştu.');
        }
        */
        
        // Simüle edilmiş başarılı yanıt
        // DOM'dan film kartını kaldır
        const movieCard = document.querySelector(`[data-movie-id="${movieId}"]`);
        if (movieCard) {
            movieCard.remove();
            
            // Favori film sayısını güncelle
            const favoriteCount = document.querySelectorAll('#favorites-container .col-md-4').length;
            document.getElementById('favorites-count').textContent = `${favoriteCount} Film`;
            
            // Eğer hiç favori film kalmadıysa "favori film yok" mesajını göster
            if (favoriteCount === 0) {
                document.getElementById('no-favorites-alert').classList.remove('d-none');
            }
        }
        
    } catch (error) {
        console.error('Film favorilerden çıkarılırken hata oluştu:', error);
        alert('Film favorilerden çıkarılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

// Film detaylarını göster
function showMovieDetails(movieId) {
    // Ana sayfadaki film detayları modalını açacak fonksiyon
    // Bu fonksiyon script.js'de tanımlanmış olmalı
    // Şimdilik yeni sayfaya yönlendiriyoruz
    window.location.href = `index.html?movie=${movieId}`;
}

// Çıkış yap
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
} 