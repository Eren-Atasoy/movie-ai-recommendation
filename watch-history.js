// TMDB API URL
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';
const TMDB_IMAGE_URL = 'https://image.tmdb.org/t/p/w500';

// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcının giriş yapmış olduğunu kontrol et
    checkAuthentication();
    
    // Profil bilgilerini yükle
    loadProfileData();
    
    // İzleme geçmişini yükle
    loadWatchHistory();
    
    // Arama olayını dinle
    const searchInput = document.getElementById('search-history');
    const searchButton = document.getElementById('search-history-btn');
    
    if (searchInput && searchButton) {
        searchButton.addEventListener('click', function() {
            searchHistory(searchInput.value);
        });
        
        searchInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                searchHistory(searchInput.value);
            }
        });
    }
    
    // Filtreleme olayını dinle
    const filterSelect = document.getElementById('filter-history');
    
    if (filterSelect) {
        filterSelect.addEventListener('change', function() {
            filterHistory(this.value);
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

// İzleme geçmişini yükle
async function loadWatchHistory() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Yükleniyor göstergesi
        const historyTableBody = document.querySelector('.history-table tbody');
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <div class="spinner-border text-primary" role="status"></div>
                    <p class="mt-3">İzleme geçmişiniz yükleniyor...</p>
                </td>
            </tr>
        `;
        
        // API'den izleme geçmişini al
        // Gerçek API entegrasyonu olmadığı için örnek veriler kullanıyoruz
        // Gerçek bir API entegrasyonu olduğunda bu kısım değiştirilmelidir
        
        // Simüle edilmiş API yanıtı
        const watchHistory = [
            {
                id: 1,
                movieId: 101,
                title: "Inception",
                poster_path: "/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
                genres: ["Bilim Kurgu", "Aksiyon", "Gerilim"],
                release_date: "2010-07-16",
                watched_date: "2023-06-15",
                user_rating: 4
            },
            {
                id: 2,
                movieId: 102,
                title: "The Shawshank Redemption",
                poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
                genres: ["Drama", "Suç"],
                release_date: "1994-09-23",
                watched_date: "2023-06-10",
                user_rating: 5
            },
            {
                id: 3,
                movieId: 103,
                title: "The Dark Knight",
                poster_path: "/1hRoyzDtpgMU7Dz4JF22RANzQO7.jpg",
                genres: ["Aksiyon", "Suç", "Gerilim"],
                release_date: "2008-07-18",
                watched_date: "2023-06-05",
                user_rating: 5
            },
            {
                id: 4,
                movieId: 104,
                title: "Pulp Fiction",
                poster_path: "/d5iIlFn5s0ImszYzBPb8JPIfbXD.jpg",
                genres: ["Suç", "Gerilim"],
                release_date: "1994-10-14",
                watched_date: "2023-05-20",
                user_rating: 4
            },
            {
                id: 5,
                movieId: 105,
                title: "The Lord of the Rings: The Return of the King",
                poster_path: "/rCzpDGLbOoPwLjy3OAm5NUPOTrC.jpg",
                genres: ["Macera", "Fantastik", "Aksiyon"],
                release_date: "2003-12-17",
                watched_date: "2023-05-15",
                user_rating: 5
            },
            {
                id: 6,
                movieId: 106,
                title: "Fight Club",
                poster_path: "/pB8BM7pdSp6B6Ih7QZ4DrQ3PmJK.jpg",
                genres: ["Drama", "Gerilim"],
                release_date: "1999-10-15",
                watched_date: "2023-05-10",
                user_rating: 4
            }
        ];
        
        // İzleme geçmişi sayısını güncelle
        document.getElementById('history-count').textContent = `${watchHistory.length} Film`;
        
        // İzleme geçmişini göster veya "geçmiş yok" mesajını göster
        if (watchHistory.length === 0) {
            document.getElementById('no-history-alert').classList.remove('d-none');
            historyTableBody.innerHTML = '';
        } else {
            document.getElementById('no-history-alert').classList.add('d-none');
            renderWatchHistory(watchHistory);
        }
        
        // İzleme istatistiklerini güncelle
        updateWatchStats(watchHistory);
        
    } catch (error) {
        console.error('İzleme geçmişi yüklenirken hata oluştu:', error);
        
        const historyTableBody = document.querySelector('.history-table tbody');
        historyTableBody.innerHTML = `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-exclamation-triangle fa-3x mb-3 text-danger"></i>
                    <h4>Bir hata oluştu</h4>
                    <p>İzleme geçmişiniz yüklenirken bir sorun oluştu. Lütfen daha sonra tekrar deneyin.</p>
                </td>
            </tr>
        `;
    }
}

// İzleme geçmişini ekrana render et
function renderWatchHistory(history) {
    const historyTableBody = document.querySelector('.history-table tbody');
    
    let html = '';
    
    history.forEach(item => {
        const releaseYear = item.release_date ? new Date(item.release_date).getFullYear() : 'N/A';
        const posterUrl = item.poster_path ? `${TMDB_IMAGE_URL}${item.poster_path}` : 'https://via.placeholder.com/50x75?text=Film';
        const watchedDate = formatDate(item.watched_date);
        const ratingStars = generateRatingStars(item.user_rating);
        
        html += `
        <tr data-history-id="${item.id}" data-movie-id="${item.movieId}">
            <td>
                <div class="history-movie-poster">
                    <img src="${posterUrl}" alt="${item.title}">
                </div>
            </td>
            <td>
                <h6 class="mb-0">${item.title}</h6>
                <small class="text-muted">${releaseYear}</small>
            </td>
            <td>${item.genres.join(', ')}</td>
            <td>${watchedDate}</td>
            <td>
                <div class="rating text-warning">
                    ${ratingStars}
                </div>
            </td>
            <td>
                <div class="btn-group btn-group-sm">
                    <button type="button" class="btn btn-outline-primary" title="Detaylar" onclick="showMovieDetails(${item.movieId})">
                        <i class="fas fa-info-circle"></i>
                    </button>
                    <button type="button" class="btn btn-outline-danger" title="Geçmişten Kaldır" onclick="removeFromHistory(${item.id})">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
        `;
    });
    
    historyTableBody.innerHTML = html;
}

// İzleme istatistiklerini güncelle
function updateWatchStats(history) {
    if (!history || history.length === 0) return;
    
    // Toplam izlenen film sayısı
    const totalMovies = history.length;
    
    // Ortalama puan
    const totalRating = history.reduce((sum, item) => sum + item.user_rating, 0);
    const averageRating = (totalRating / totalMovies).toFixed(1);
    
    // Toplam izleme süresi (varsayılan olarak her film 2 saat)
    const totalHours = totalMovies * 2;
    
    // İstatistikleri güncelle
    document.querySelector('.display-4:nth-of-type(1)').textContent = totalMovies;
    document.querySelector('.display-4:nth-of-type(2)').textContent = totalHours;
    document.querySelector('.display-4:nth-of-type(3)').textContent = averageRating;
    
    // Tür istatistiklerini hesapla
    const genreCounts = {};
    let totalGenres = 0;
    
    history.forEach(item => {
        item.genres.forEach(genre => {
            genreCounts[genre] = (genreCounts[genre] || 0) + 1;
            totalGenres++;
        });
    });
    
    // Türleri sırala
    const sortedGenres = Object.entries(genreCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 4); // En çok izlenen 4 tür
    
    // Tür istatistiklerini güncelle
    const progressBars = document.querySelectorAll('.progress');
    
    sortedGenres.forEach((genre, index) => {
        if (index < progressBars.length) {
            const genreName = genre[0];
            const genreCount = genre[1];
            const percentage = Math.round((genreCount / totalGenres) * 100);
            
            const progressBarContainer = progressBars[index].parentElement;
            const genreLabel = progressBarContainer.previousElementSibling.querySelector('span:first-child');
            const percentageLabel = progressBarContainer.previousElementSibling.querySelector('span:last-child');
            const progressBar = progressBars[index].querySelector('.progress-bar');
            
            genreLabel.textContent = genreName;
            percentageLabel.textContent = `${percentage}%`;
            progressBar.style.width = `${percentage}%`;
            progressBar.setAttribute('aria-valuenow', percentage);
        }
    });
}

// İzleme geçmişini ara
function searchHistory(query) {
    if (!query) {
        loadWatchHistory();
        return;
    }
    
    query = query.toLowerCase();
    
    // Tüm tablo satırlarını seç
    const historyRows = document.querySelectorAll('.history-table tbody tr');
    
    let visibleRows = 0;
    
    historyRows.forEach(row => {
        const title = row.querySelector('h6').textContent.toLowerCase();
        const genres = row.querySelector('td:nth-child(3)').textContent.toLowerCase();
        
        if (title.includes(query) || genres.includes(query)) {
            row.style.display = '';
            visibleRows++;
        } else {
            row.style.display = 'none';
        }
    });
    
    // Görünür film sayısını güncelle
    document.getElementById('history-count').textContent = `${visibleRows} Film`;
    
    // Hiç sonuç yoksa mesaj göster
    if (visibleRows === 0) {
        const historyTableBody = document.querySelector('.history-table tbody');
        historyTableBody.innerHTML += `
            <tr>
                <td colspan="6" class="text-center py-5">
                    <i class="fas fa-search fa-3x mb-3 text-muted"></i>
                    <h4>Sonuç bulunamadı</h4>
                    <p>"${query}" için izleme geçmişinde film bulunamadı.</p>
                </td>
            </tr>
        `;
    }
}

// İzleme geçmişini filtrele
function filterHistory(filterValue) {
    // Tüm tablo satırlarını seç
    const historyRows = Array.from(document.querySelectorAll('.history-table tbody tr'));
    
    if (historyRows.length === 0 || historyRows[0].querySelector('td').colSpan) return;
    
    // Filtreleme değerine göre sırala
    switch (filterValue) {
        case 'date-watched-desc':
            // En son izlenen en üstte (varsayılan)
            historyRows.sort((a, b) => {
                const dateA = a.querySelector('td:nth-child(4)').textContent;
                const dateB = b.querySelector('td:nth-child(4)').textContent;
                return new Date(dateB) - new Date(dateA);
            });
            break;
            
        case 'date-watched-asc':
            // En eski izlenen en üstte
            historyRows.sort((a, b) => {
                const dateA = a.querySelector('td:nth-child(4)').textContent;
                const dateB = b.querySelector('td:nth-child(4)').textContent;
                return new Date(dateA) - new Date(dateB);
            });
            break;
            
        case 'rating-desc':
            // En yüksek puanlı en üstte
            historyRows.sort((a, b) => {
                const ratingA = countStars(a.querySelector('.rating').innerHTML);
                const ratingB = countStars(b.querySelector('.rating').innerHTML);
                return ratingB - ratingA;
            });
            break;
            
        case 'rating-asc':
            // En düşük puanlı en üstte
            historyRows.sort((a, b) => {
                const ratingA = countStars(a.querySelector('.rating').innerHTML);
                const ratingB = countStars(b.querySelector('.rating').innerHTML);
                return ratingA - ratingB;
            });
            break;
            
        case 'title-asc':
            // A-Z sıralaması
            historyRows.sort((a, b) => {
                const titleA = a.querySelector('h6').textContent;
                const titleB = b.querySelector('h6').textContent;
                return titleA.localeCompare(titleB);
            });
            break;
            
        case 'title-desc':
            // Z-A sıralaması
            historyRows.sort((a, b) => {
                const titleA = a.querySelector('h6').textContent;
                const titleB = b.querySelector('h6').textContent;
                return titleB.localeCompare(titleA);
            });
            break;
    }
    
    // Sıralanmış satırları tekrar ekle
    const historyTableBody = document.querySelector('.history-table tbody');
    historyTableBody.innerHTML = '';
    
    historyRows.forEach(row => {
        historyTableBody.appendChild(row);
    });
}

// İzleme geçmişinden kaldır
function removeFromHistory(historyId) {
    try {
        const token = localStorage.getItem('authToken');
        
        // API isteği (gerçek API entegrasyonu olmadığı için simüle ediyoruz)
        // Gerçek bir API entegrasyonu olduğunda bu kısım değiştirilmelidir
        /*
        const response = await fetch(`${API_BASE_URL}/auth/watch-history/${historyId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Film izleme geçmişinden çıkarılırken bir hata oluştu.');
        }
        */
        
        // Simüle edilmiş başarılı yanıt
        // DOM'dan film satırını kaldır
        const historyRow = document.querySelector(`tr[data-history-id="${historyId}"]`);
        if (historyRow) {
            historyRow.remove();
            
            // İzleme geçmişi sayısını güncelle
            const historyCount = document.querySelectorAll('.history-table tbody tr').length;
            document.getElementById('history-count').textContent = `${historyCount} Film`;
            
            // Eğer hiç izleme geçmişi kalmadıysa "geçmiş yok" mesajını göster
            if (historyCount === 0) {
                document.getElementById('no-history-alert').classList.remove('d-none');
                document.querySelector('.history-table tbody').innerHTML = '';
            }
        }
        
    } catch (error) {
        console.error('Film izleme geçmişinden çıkarılırken hata oluştu:', error);
        alert('Film izleme geçmişinden çıkarılırken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

// Film detaylarını göster
function showMovieDetails(movieId) {
    // Ana sayfadaki film detayları modalını açacak fonksiyon
    // Bu fonksiyon script.js'de tanımlanmış olmalı
    // Şimdilik yeni sayfaya yönlendiriyoruz
    window.location.href = `index.html?movie=${movieId}`;
}

// Yardımcı fonksiyonlar
function formatDate(dateString) {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('tr-TR', options);
}

function generateRatingStars(rating) {
    let stars = '';
    for (let i = 1; i <= 5; i++) {
        if (i <= rating) {
            stars += '<i class="fas fa-star"></i>';
        } else {
            stars += '<i class="far fa-star"></i>';
        }
    }
    return stars;
}

function countStars(html) {
    return (html.match(/fas fa-star/g) || []).length;
}

// Çıkış yap
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
} 