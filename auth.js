// API URL
const API_BASE_URL = 'https://localhost:7111/api';

// DOM elementlerini seç
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const loginError = document.getElementById('loginError');
    const registerError = document.getElementById('registerError');
    const authButtons = document.getElementById('auth-buttons');
    
    // LocalStorage'dan token'ı temizle (geliştirme aşamasında)
    // Bu satırı geliştirme tamamlandığında kaldırabilirsiniz
    // localStorage.removeItem('authToken');
    
    // Eğer token varsa kullanıcı giriş yapmış demektir
    checkAuthStatus();
    
    // Login form submit
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const email = document.getElementById('loginEmail').value;
            const password = document.getElementById('loginPassword').value;
            
            // Form doğrulama
            if (!email || !password) {
                showError(loginError, 'Lütfen tüm alanları doldurun.');
                return;
            }
            
            try {
                // Login API isteği
                const response = await fetch(`${API_BASE_URL}/auth/login`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (!response.ok) {
                    throw new Error(data.message || 'Giriş yapılırken bir hata oluştu.');
                }
                
                // Token'ı localStorage'a kaydet
                localStorage.setItem('authToken', data.token);
                
                // Başarılı giriş
                showSuccess(loginError, 'Giriş başarılı! Yönlendiriliyorsunuz...');
                
                // Kullanıcı bilgilerini al ve sakla
                const userData = await fetchUserData();
                if (userData) {
                    localStorage.setItem('userData', JSON.stringify(userData));
                }
                
                // Kullanıcı arayüzünü güncelle
                updateUI(true);
                
                // Modalı kapat
                const loginModal = bootstrap.Modal.getInstance(document.getElementById('loginModal'));
                loginModal.hide();
                
            } catch (error) {
                showError(loginError, error.message || 'Giriş yapılırken bir hata oluştu.');
            }
        });
    }
    
    // Register form submit
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Form verilerini al
            const username = document.getElementById('registerUsername').value;
            const email = document.getElementById('registerEmail').value;
            const password = document.getElementById('registerPassword').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            const termsCheck = document.getElementById('termsCheck').checked;
            
            // Form doğrulama
            if (!username || !email || !password || !confirmPassword) {
                showError(registerError, 'Lütfen tüm alanları doldurun.');
                return;
            }
            
            if (password !== confirmPassword) {
                showError(registerError, 'Şifreler eşleşmiyor.');
                return;
            }
            
            if (!termsCheck) {
                showError(registerError, 'Kullanım koşullarını kabul etmelisiniz.');
                return;
            }
            
            try {
                // Register API isteği
                const response = await fetch(`${API_BASE_URL}/auth/register`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        username: username,
                        email: email,
                        password: password,
                        confirmPassword: confirmPassword,
                        termsAccepted: termsCheck
                    })
                });

                // Yanıtı kontrol et
                const responseText = await response.text(); // Önce text olarak al
                let data;
                try {
                    data = JSON.parse(responseText); // JSON'a çevirmeyi dene
                } catch {
                    // Eğer JSON değilse, direkt mesaj olarak kullan
                    data = { message: responseText };
                }
                
                if (!response.ok) {
                    throw new Error(data.message || 'Kayıt olurken bir hata oluştu.');
                }
                
                // Başarılı kayıt
                showSuccess(registerError, 'Kayıt başarılı! Şimdi giriş yapabilirsiniz.');
                
                // Login tab'ına geç
                const loginTab = document.getElementById('login-tab');
                const loginTabTrigger = new bootstrap.Tab(loginTab);
                loginTabTrigger.show();
                
                // Register formunu temizle
                registerForm.reset();
                
            } catch (error) {
                showError(registerError, error.message || 'Kayıt olurken bir hata oluştu.');
            }
        });
    }
    
    // Çıkış yap butonu için event listener
    document.addEventListener('click', function(e) {
        if (e.target && e.target.id === 'logoutBtn') {
            logout();
        }
    });
    
    // Eğer profil sayfasındaysak ve kullanıcı giriş yapmamışsa ana sayfaya yönlendir
    const isProfilePage = window.location.pathname.includes('profile.html') || 
                        window.location.pathname.includes('favorites.html') || 
                        window.location.pathname.includes('watch-history.html');
    
    if (isProfilePage) {
        checkAuthAndRedirect();
    }
});

// Kullanıcı giriş durumunu kontrol et ve profil sayfalarında yönlendir
async function checkAuthAndRedirect() {
    const token = localStorage.getItem('authToken');
    
    if (!token) {
        window.location.href = 'index.html';
        return;
    }
    
    try {
        // Token geçerliliğini kontrol et
        const tokenParts = token.split('.');
        if (tokenParts.length !== 3) {
            logout();
            return;
        }
        
        // Token'ın süresini kontrol et
        const payload = JSON.parse(atob(tokenParts[1]));
        const expiry = payload.exp * 1000; // milisaniyeye çevir
        
        if (Date.now() >= expiry) {
            logout();
            return;
        }
        
        // Kullanıcı bilgilerini kontrol et
        let userData = localStorage.getItem('userData');
        
        if (!userData) {
            // Kullanıcı bilgileri yoksa API'den al
            const fetchedUserData = await fetchUserData();
            if (!fetchedUserData) {
                logout();
                return;
            }
            
            localStorage.setItem('userData', JSON.stringify(fetchedUserData));
        }
        
        // Kullanıcı bilgilerini yükle (profil sayfalarında)
        loadUserProfileData();
        
    } catch (error) {
        console.error('Token doğrulama hatası:', error);
        logout();
    }
}

// Kullanıcı bilgilerini API'den al
async function fetchUserData() {
    const token = localStorage.getItem('authToken');
    
    if (!token) return null;
    
    try {
        const response = await fetch(`${API_BASE_URL}/auth/user`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        if (!response.ok) {
            throw new Error('Kullanıcı bilgileri alınamadı');
        }
        
        return await response.json();
    } catch (error) {
        console.error('Kullanıcı bilgileri alınamadı:', error);
        return null;
    }
}

// Profil bilgilerini yükle
function loadUserProfileData() {
    // LocalStorage'dan kullanıcı bilgilerini al
    const userDataStr = localStorage.getItem('userData');
    if (!userDataStr) return;
    
    const userData = JSON.parse(userDataStr);
    
    // Profil sayfasındaki elementleri güncelle
    const usernameElement = document.getElementById('profile-username');
    const emailElement = document.getElementById('profile-email');
    
    if (usernameElement) usernameElement.textContent = userData.username;
    if (emailElement) emailElement.textContent = userData.email;
    
    // Profil formu varsa form alanlarını doldur
    const usernameInput = document.getElementById('username');
    const emailInput = document.getElementById('email');
    
    if (usernameInput) usernameInput.value = userData.username;
    if (emailInput) emailInput.value = userData.email;
}

// Kullanıcı giriş durumunu kontrol et
async function checkAuthStatus() {
    const token = localStorage.getItem('authToken');
    
    // Token geçerliliğini kontrol et
    if (token) {
        try {
            // Token'ın geçerliliğini kontrol et (basit bir kontrol)
            const tokenParts = token.split('.');
            if (tokenParts.length !== 3) {
                // Geçersiz token formatı
                localStorage.removeItem('authToken');
                updateUI(false);
                return;
            }
            
            // Token'ın süresini kontrol et
            const payload = JSON.parse(atob(tokenParts[1]));
            const expiry = payload.exp * 1000; // milisaniyeye çevir
            
            if (Date.now() >= expiry) {
                // Token süresi dolmuş
                localStorage.removeItem('authToken');
                updateUI(false);
                return;
            }
            
            // Kullanıcı bilgilerini kontrol et
            let userData = localStorage.getItem('userData');
            
            if (!userData) {
                // Kullanıcı bilgileri yoksa API'den al
                const fetchedUserData = await fetchUserData();
                if (fetchedUserData) {
                    localStorage.setItem('userData', JSON.stringify(fetchedUserData));
                }
            }
            
            // Token geçerli
            updateUI(true);
        } catch (error) {
            console.error('Token doğrulama hatası:', error);
            localStorage.removeItem('authToken');
            localStorage.removeItem('userData');
            updateUI(false);
        }
    } else {
        // Token yok
        localStorage.removeItem('userData');
        updateUI(false);
    }
}

// Kullanıcı arayüzünü güncelle (giriş yapılmış/yapılmamış durumuna göre)
function updateUI(isLoggedIn) {
    const authButtons = document.getElementById('auth-buttons');
    
    if (isLoggedIn) {
        authButtons.innerHTML = `
            <div class="dropdown">
                <button class="btn btn-outline-light dropdown-toggle" type="button" id="userDropdown" data-bs-toggle="dropdown" aria-expanded="false">
                    <i class="fas fa-user me-1"></i> Hesabım
                </button>
                <ul class="dropdown-menu dropdown-menu-end" aria-labelledby="userDropdown">
                    <li><a class="dropdown-item" href="profile.html"><i class="fas fa-user-circle me-2"></i>Profilim</a></li>
                    <li><a class="dropdown-item" href="favorites.html"><i class="fas fa-heart me-2"></i>Favorilerim</a></li>
                    <li><a class="dropdown-item" href="watch-history.html"><i class="fas fa-history me-2"></i>İzleme Geçmişi</a></li>
                    <li><hr class="dropdown-divider"></li>
                    <li><a class="dropdown-item" href="#" id="logoutBtn"><i class="fas fa-sign-out-alt me-2"></i>Çıkış Yap</a></li>
                </ul>
            </div>
        `;
        
        // Çıkış butonuna event listener ekle
        document.getElementById('logoutBtn').addEventListener('click', (e) => {
            e.preventDefault();
            logout();
        });
    } else {
        authButtons.innerHTML = `
            <button class="btn btn-outline-light" type="button" data-bs-toggle="modal" data-bs-target="#loginModal">
                <i class="fas fa-user me-1"></i> Giriş Yap
            </button>
        `;
    }
    
    // Film kartlarındaki butonları da güncelle
    updateMovieCardButtons(isLoggedIn);
}

// Film kartlarındaki butonları güncelle
function updateMovieCardButtons(isLoggedIn) {
    const detailButtons = document.querySelectorAll('.movie-card .btn');
    
    detailButtons.forEach(button => {
        if (isLoggedIn) {
            button.removeAttribute('data-bs-toggle');
            button.removeAttribute('data-bs-target');
            button.innerHTML = 'Detaylar';
        } else {
            button.setAttribute('data-bs-toggle', 'modal');
            button.setAttribute('data-bs-target', '#loginModal');
            button.innerHTML = '<i class="fas fa-lock me-1"></i> Giriş Yapın';
        }
    });
}

// Çıkış yap
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    updateUI(false);
    
    // Ana sayfaya yönlendir
    window.location.href = 'index.html';
}

// Hata mesajı göster
function showError(element, message) {
    element.textContent = message;
    element.classList.remove('d-none', 'alert-success');
    element.classList.add('alert-danger');
}

// Başarı mesajı göster
function showSuccess(element, message) {
    element.textContent = message;
    element.classList.remove('d-none', 'alert-danger');
    element.classList.add('alert-success');
} 