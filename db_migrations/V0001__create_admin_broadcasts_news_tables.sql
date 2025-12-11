-- Create admin table for authentication
CREATE TABLE IF NOT EXISTS admin (
    id SERIAL PRIMARY KEY,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create broadcasts table
CREATE TABLE IF NOT EXISTS broadcasts (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    video_url TEXT NOT NULL,
    is_live BOOLEAN DEFAULT false,
    scheduled_time TIME,
    scheduled_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create news table
CREATE TABLE IF NOT EXISTS news (
    id SERIAL PRIMARY KEY,
    title TEXT NOT NULL,
    excerpt TEXT NOT NULL,
    content TEXT,
    image_url TEXT,
    published_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin password (hashed version of "admin123")
INSERT INTO admin (password_hash) 
VALUES ('$2b$10$rG8qKqvVvZ4dN5xK5hJ5xuYQXhK.R6lR7mXZ9L/3L6bE.3pJ5K5K6');

-- Insert sample broadcasts
INSERT INTO broadcasts (title, video_url, is_live, scheduled_time, scheduled_date) VALUES
('Кубок мира - Биатлон 2024', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', true, '14:00', '2024-12-15'),
('Кубок мира по биатлону - Мужской спринт', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, '15:00', '2024-12-15'),
('Лыжные гонки - Женская эстафета', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', false, '18:30', '2024-12-15');

-- Insert sample news
INSERT INTO news (title, excerpt, content, image_url, published_date) VALUES
('Российские биатлонисты завоевали золото на этапе Кубка мира', 
 'Сборная России показала блестящий результат в смешанной эстафете, опередив команды Норвегии и Франции.',
 'Полный текст новости о победе российских биатлонистов...',
 'https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=800&h=450&fit=crop',
 '2024-12-14'),
('Новый рекорд трассы установлен в лыжных гонках',
 'На дистанции 15 км классическим стилем был установлен рекорд трассы, который продержался более 5 лет.',
 'Полный текст новости о рекорде...',
 'https://images.unsplash.com/photo-1483654363457-c8ebe6f35c6d?w=800&h=450&fit=crop',
 '2024-12-13'),
('Анонс: грядущий этап Кубка мира в Финляндии',
 'Следующий этап Кубка мира пройдет на легендарных трассах Лахти. Ожидаются напряженные борьба за лидерство.',
 'Полный текст анонса...',
 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&h=450&fit=crop',
 '2024-12-12');
