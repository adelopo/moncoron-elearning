# Use PHP 8.3 with Nginx and PHP-FPM
FROM php:8.3-fpm

# Create a non-root user
RUN useradd -m user

# Set the working directory
WORKDIR /app

# Switch to root user for package installation
USER root

# Install necessary PHP extensions and Nginx, including oniguruma for mbstring
RUN apt-get update && \
    apt-get install -y nginx libpng-dev libjpeg-dev libfreetype6-dev zip unzip git libonig-dev curl && \
    docker-php-ext-configure gd --with-freetype --with-jpeg && \
    docker-php-ext-install gd pdo pdo_mysql mbstring exif pcntl bcmath && \
    rm -rf /var/lib/apt/lists/*

# Create necessary Nginx directories and set permissions
RUN mkdir -p /var/lib/nginx/tmp/client_body /var/log/nginx /var/lib/nginx/body && \
    chown -R user:user /var/lib/nginx /var/log/nginx /var/lib/nginx/tmp/client_body && \
    chmod -R 755 /var/lib/nginx /var/log/nginx /var/lib/nginx/tmp/client_body

# Install Node.js and npm
RUN curl -sL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Install Composer
COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

# Copy all project files to the container
COPY . /app

# Ensure the /app directory is writable by the non-root user
RUN chown -R user:user /app

# Switch to the non-root user for the next steps
USER user

# Ensure artisan is executable (after copying files)
RUN chmod 755 /app/artisan

# Copy the .env file (or .env.example) into the container
COPY .env.example /app/.env

# Clear Composer cache and install Composer dependencies as root
USER root
RUN composer clear-cache && \
    composer install --ignore-platform-reqs --prefer-dist --no-scripts --no-progress --no-suggest --no-interaction --no-dev --no-autoloader

# Generate optimized autoload files and run post-install scripts as root
RUN composer dump-autoload && composer run-script post-autoload-dump

# Switch back to non-root user
USER user

# Install Node.js dependencies
RUN npm ci

# Copy Nginx configuration file
COPY ./conf/nginx/nginx-site.conf /etc/nginx/sites-available/default

# Expose port 80 for web traffic
EXPOSE 80

# Switch back to root to start services
USER root

# Set permissions for storage and cache
RUN chown -R www-data:www-data /app/storage /app/bootstrap/cache

# Start Nginx and PHP-FPM
CMD ["sh", "-c", "nginx -g 'daemon off;' & php-fpm"]
