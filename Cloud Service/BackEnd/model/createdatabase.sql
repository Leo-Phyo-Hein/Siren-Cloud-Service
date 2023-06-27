-- Create users table
CREATE TABLE `{DATABASE_NAME}`.`users` (
    user_id INT NOT NULL AUTO_INCREMENT,
    username VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    user_password VARCHAR(255) NOT NULL,
    user_role VARCHAR(255) NOT NULL,
    user_secret VARCHAR(255) NOT NULL,
    created_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_email),
    PRIMARY KEY (user_id)
);

-- Create content table
CREATE TABLE `{DATABASE_NAME}`.`content` (
    content_id INT NOT NULL AUTO_INCREMENT,
    creator_id INT NOT NULL,
    content_title VARCHAR(255) NOT NULL,
    content_desc VARCHAR(255) NOT NULL,
    content_thumbnail VARCHAR(255) NOT NULL,
    content VARCHAR(255) NOT NULL,
    content_private INT NOT NULL,
    uploaded_on TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (content_id),
    FOREIGN KEY (creator_id) REFERENCES `{DATABASE_NAME}`.`users`(user_id)
);