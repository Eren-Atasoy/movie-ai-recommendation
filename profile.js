// DOM yüklendiğinde çalışacak fonksiyonlar
document.addEventListener('DOMContentLoaded', function() {
    // Kullanıcının giriş yapmış olduğunu kontrol et
    checkAuthentication();
    
    // Profil formunu seç
    const profileForm = document.getElementById('profileForm');
    const passwordForm = document.getElementById('passwordForm');
    
    // Profil bilgilerini yükle
    loadProfileData();
    
    // Profil formu submit olayı
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateProfile();
        });
    }
    
    // Şifre değiştirme formu submit olayı
    if (passwordForm) {
        passwordForm.addEventListener('submit', function(e) {
            e.preventDefault();
            changePassword();
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
async function loadProfileData() {
    try {
        // LocalStorage'dan kullanıcı bilgilerini al
        const userDataStr = localStorage.getItem('userData');
        if (!userDataStr) {
            throw new Error('Kullanıcı bilgileri bulunamadı');
        }
        
        const userData = JSON.parse(userDataStr);
        
        // Profil bilgilerini form alanlarına doldur
        document.getElementById('username').value = userData.username || '';
        document.getElementById('email').value = userData.email || '';
        
        // Diğer profil bilgileri (API'den gelmiyorsa varsayılan değerler kullanılabilir)
        const fullName = userData.fullName || '';
        const birthDate = userData.birthDate || '';
        const bio = userData.bio || 'Film izlemeyi ve yeni türleri keşfetmeyi seviyorum.';
        const favoriteGenre = userData.favoriteGenre || 'scifi';
        const language = userData.language || 'tr';
        const newsletter = userData.newsletter !== undefined ? userData.newsletter : true;
        const joinDate = userData.joinDate || 'Ocak 2023';
        
        // Form alanlarını doldur
        document.getElementById('fullName').value = fullName;
        document.getElementById('birthDate').value = birthDate;
        document.getElementById('bio').value = bio;
        
        if (favoriteGenre) {
            document.getElementById('favoriteGenre').value = favoriteGenre;
        }
        
        if (language) {
            document.getElementById('language').value = language;
        }
        
        document.getElementById('newsletter').checked = newsletter;
        
        // Profil başlık bilgilerini güncelle
        document.getElementById('profile-username').textContent = userData.username || 'Kullanıcı Adı';
        document.getElementById('profile-email').textContent = userData.email || 'kullanici@ornek.com';
        document.getElementById('profile-join-date').textContent = joinDate;
        
    } catch (error) {
        console.error('Profil bilgileri yüklenirken hata oluştu:', error);
        showProfileError('Profil bilgileri yüklenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

// Profil bilgilerini güncelle
async function updateProfile() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Form verilerini al
        const username = document.getElementById('username').value;
        const fullName = document.getElementById('fullName').value;
        const birthDate = document.getElementById('birthDate').value;
        const bio = document.getElementById('bio').value;
        const favoriteGenre = document.getElementById('favoriteGenre').value;
        const language = document.getElementById('language').value;
        const newsletter = document.getElementById('newsletter').checked;
        
        // Form doğrulama
        if (!username) {
            showProfileError('Kullanıcı adı boş olamaz.');
            return;
        }
        
        // Profil verilerini hazırla
        const profileData = {
            username,
            fullName,
            birthDate,
            bio,
            favoriteGenre,
            language,
            newsletter
        };
        
        // API isteği (gerçek API entegrasyonu olmadığı için simüle ediyoruz)
        // Gerçek bir API entegrasyonu olduğunda bu kısım değiştirilmelidir
        /*
        const response = await fetch(`${API_BASE_URL}/auth/update-profile`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(profileData)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Profil güncellenirken bir hata oluştu.');
        }
        */
        
        // Simüle edilmiş başarılı yanıt
        // Mevcut kullanıcı bilgilerini al ve güncelle
        const userDataStr = localStorage.getItem('userData');
        const userData = userDataStr ? JSON.parse(userDataStr) : {};
        
        // Kullanıcı bilgilerini güncelle
        userData.username = username;
        userData.fullName = fullName;
        userData.birthDate = birthDate;
        userData.bio = bio;
        userData.favoriteGenre = favoriteGenre;
        userData.language = language;
        userData.newsletter = newsletter;
        
        // Güncellenmiş kullanıcı bilgilerini kaydet
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Profil başlık bilgilerini güncelle
        document.getElementById('profile-username').textContent = username;
        
        // Başarı mesajı göster
        showProfileSuccess('Profil bilgileriniz başarıyla güncellendi.');
        
    } catch (error) {
        console.error('Profil güncellenirken hata oluştu:', error);
        showProfileError('Profil güncellenirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

// Şifre değiştir
async function changePassword() {
    try {
        const token = localStorage.getItem('authToken');
        
        // Form verilerini al
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        
        // Form doğrulama
        if (!currentPassword || !newPassword || !confirmNewPassword) {
            showPasswordError('Lütfen tüm alanları doldurun.');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showPasswordError('Yeni şifreler eşleşmiyor.');
            return;
        }
        
        if (newPassword.length < 8) {
            showPasswordError('Yeni şifre en az 8 karakter olmalıdır.');
            return;
        }
        
        // Şifre verilerini hazırla
        const passwordData = {
            currentPassword,
            newPassword,
            confirmNewPassword
        };
        
        // API isteği (gerçek API entegrasyonu olmadığı için simüle ediyoruz)
        // Gerçek bir API entegrasyonu olduğunda bu kısım değiştirilmelidir
        /*
        const response = await fetch(`${API_BASE_URL}/auth/change-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(passwordData)
        });
        
        if (!response.ok) {
            const data = await response.json();
            throw new Error(data.message || 'Şifre değiştirilirken bir hata oluştu.');
        }
        */
        
        // Simüle edilmiş başarılı yanıt
        // Formu temizle
        document.getElementById('passwordForm').reset();
        
        // Başarı mesajı göster
        showPasswordSuccess('Şifreniz başarıyla değiştirildi.');
        
    } catch (error) {
        console.error('Şifre değiştirilirken hata oluştu:', error);
        showPasswordError('Şifre değiştirilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.');
    }
}

// Profil hata mesajı göster
function showProfileError(message) {
    const errorElement = document.getElementById('profileError');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
    
    // Başarı mesajını gizle
    document.getElementById('profileSuccess').classList.add('d-none');
    
    // 5 saniye sonra hata mesajını gizle
    setTimeout(() => {
        errorElement.classList.add('d-none');
    }, 5000);
}

// Profil başarı mesajı göster
function showProfileSuccess(message) {
    const successElement = document.getElementById('profileSuccess');
    successElement.textContent = message;
    successElement.classList.remove('d-none');
    
    // Hata mesajını gizle
    document.getElementById('profileError').classList.add('d-none');
    
    // 5 saniye sonra başarı mesajını gizle
    setTimeout(() => {
        successElement.classList.add('d-none');
    }, 5000);
}

// Şifre hata mesajı göster
function showPasswordError(message) {
    const errorElement = document.getElementById('passwordError');
    errorElement.textContent = message;
    errorElement.classList.remove('d-none');
    
    // Başarı mesajını gizle
    document.getElementById('passwordSuccess').classList.add('d-none');
    
    // 5 saniye sonra hata mesajını gizle
    setTimeout(() => {
        errorElement.classList.add('d-none');
    }, 5000);
}

// Şifre başarı mesajı göster
function showPasswordSuccess(message) {
    const successElement = document.getElementById('passwordSuccess');
    successElement.textContent = message;
    successElement.classList.remove('d-none');
    
    // Hata mesajını gizle
    document.getElementById('passwordError').classList.add('d-none');
    
    // 5 saniye sonra başarı mesajını gizle
    setTimeout(() => {
        successElement.classList.add('d-none');
    }, 5000);
}

// Çıkış yap
function logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    window.location.href = 'index.html';
} 