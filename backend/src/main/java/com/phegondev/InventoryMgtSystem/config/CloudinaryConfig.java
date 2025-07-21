package com.phegondev.InventoryMgtSystem.config;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class CloudinaryConfig {
    @Bean
    public Cloudinary cloudinary() {
        return new Cloudinary(ObjectUtils.asMap(
                "cloud_name", "deqlnixkq",
                "api_key", "653968282632918",
                "api_secret", "SYYlWVyrJbNEDmeBHoRmzoHZxTw"));
    }

}