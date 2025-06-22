// TMDB API için sabitler
const API_TOKEN = 'eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiI4Yzg0YjhiM2QzYzc1M2I3OTFiOWQ0ZWE1NWQxZDk1MiIsIm5iZiI6MTY5NzM3OTM3NC4zMjUsInN1YiI6IjY1MmJmNDJlMzU4ZGE3MDBjNmYxYTAzMCIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.3mGa1aahZLkdhfXR6N4MwhJ1i6d0GeW02p0164PVQX4';
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';
const DEFAULT_IMAGE = 'https://via.placeholder.com/500x750?text=Film+Afişi';

// API isteği için ortak seçenekler
const API_OPTIONS = {
    method: 'GET',
    headers: {
        accept: 'application/json',
        Authorization: `Bearer ${API_TOKEN}`
    }
};

// TMDB API anahtarı
const API_KEY = '3fd2be6f0c70a2a598f084ddfb75487c'; // Örnek API anahtarı

// API istekleri için yardımcı fonksiyon
async function fetchFromAPI(endpoint, params = {}) {
    // API parametrelerini hazırla
    const queryParams = new URLSearchParams({
        api_key: API_KEY,
        language: 'tr-TR',
        ...params
    });
    
    try {
        // API isteği gönder
        const response = await fetch(`${BASE_URL}${endpoint}?${queryParams}`);
        
        if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API isteği sırasında hata:', error);
        throw error;
    }
}

// Yetkilendirme gerektiren API istekleri için yardımcı fonksiyon
async function fetchWithAuth(endpoint, params = {}) {
    // Kullanıcı token'ını al
    const authToken = localStorage.getItem('authToken');
    
    // URL parametrelerini hazırla
    const queryString = new URLSearchParams(params).toString();
    const url = `${BASE_URL}${endpoint}?${queryString}&language=tr-TR`;
    
    try {
        // API isteği gönder
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                accept: 'application/json',
                Authorization: `Bearer ${API_TOKEN}`,
                'User-Auth-Token': authToken || '' // Backend API için kullanıcı token'ı
            }
        });
        
        if (!response.ok) {
            throw new Error(`API isteği başarısız: ${response.status}`);
        }
        
        return await response.json();
    } catch (error) {
        console.error('API isteği sırasında hata:', error);
        throw error;
    }
}

// Popüler filmleri getir
async function getPopularMovies() {
    try {
        const response = await fetch(`${BASE_URL}/movie/popular?language=tr-TR&page=1`, API_OPTIONS);
        if (!response.ok) throw new Error('Popüler filmler alınamadı');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('TMDB API hatası:', error);
        throw error;
    }
}

// Film detaylarını getir
async function getMovieDetails(movieId) {
    // Film detayları için yetkilendirme gerekebilir
    const isLoggedIn = !!localStorage.getItem('authToken');
    
    try {
        if (isLoggedIn) {
            // Kullanıcı giriş yapmışsa, kullanıcı token'ı ile istek yap
            return await fetchWithAuth(`/movie/${movieId}`, {});
        } else {
            // Kullanıcı giriş yapmamışsa, normal API isteği yap
            const response = await fetch(`${BASE_URL}/movie/${movieId}?language=tr-TR`, API_OPTIONS);
            if (!response.ok) throw new Error('Film detayları alınamadı');
            return await response.json();
        }
    } catch (error) {
        console.error('TMDB API hatası:', error);
        throw error;
    }
}

// Film ara
async function searchMovies(query) {
    try {
        const response = await fetch(`${BASE_URL}/search/movie?language=tr-TR&query=${encodeURIComponent(query)}&page=1&include_adult=false`, API_OPTIONS);
        if (!response.ok) throw new Error('Film araması başarısız');
        const data = await response.json();
        return data.results;
    } catch (error) {
        console.error('TMDB API hatası:', error);
        throw error;
    }
}

// Film önerileri getir
async function getMovieRecommendations(movieId) {
    // Film önerileri için yetkilendirme gerekebilir
    const isLoggedIn = !!localStorage.getItem('authToken');
    
    try {
        if (isLoggedIn) {
            // Kullanıcı giriş yapmışsa, kullanıcı token'ı ile istek yap
            const data = await fetchWithAuth(`/movie/${movieId}/recommendations`, {});
            return data.results;
        } else {
            // Kullanıcı giriş yapmamışsa, normal API isteği yap
            const response = await fetch(`${BASE_URL}/movie/${movieId}/recommendations?language=tr-TR&page=1`, API_OPTIONS);
            if (!response.ok) throw new Error('Film önerileri alınamadı');
            const data = await response.json();
            return data.results;
        }
    } catch (error) {
        console.error('TMDB API hatası:', error);
        throw error;
    }
}

// Film türlerini getir
async function getGenres() {
    try {
        const response = await fetch(`${BASE_URL}/genre/movie/list?language=tr-TR`, API_OPTIONS);
        if (!response.ok) throw new Error('Film türleri alınamadı');
        const data = await response.json();
        return data.genres;
    } catch (error) {
        console.error('TMDB API hatası:', error);
        throw error;
    }
}

// Film türlerinin isimlerini getir
function getGenreNames(genreIds, allGenres) {
    if (!genreIds || !allGenres) return [];
    
    return genreIds
        .map(id => {
            const genre = allGenres.find(g => g.id === id);
            return genre ? genre.name : null;
        })
        .filter(name => name !== null);
}

// Film afişi URL'sini getir
function getImageUrl(path) {
    if (!path) {
        return DEFAULT_IMAGE;
    }
    return `${IMAGE_BASE_URL}${path}`;
}

// Dışa aktarılan fonksiyonlar
export {
    getPopularMovies,
    getMovieDetails,
    searchMovies,
    getMovieRecommendations,
    getGenres,
    getGenreNames,
    getImageUrl
}; 