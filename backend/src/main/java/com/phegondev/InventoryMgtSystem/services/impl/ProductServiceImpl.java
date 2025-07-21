package com.phegondev.InventoryMgtSystem.services.impl;


import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.phegondev.InventoryMgtSystem.dtos.ProductDTO;
import com.phegondev.InventoryMgtSystem.dtos.Response;
import com.phegondev.InventoryMgtSystem.exceptions.NotFoundException;
import com.phegondev.InventoryMgtSystem.models.Category;
import com.phegondev.InventoryMgtSystem.models.Product;
import com.phegondev.InventoryMgtSystem.repositories.CategoryRepository;
import com.phegondev.InventoryMgtSystem.repositories.ProductRepository;
import com.phegondev.InventoryMgtSystem.services.ProductService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.modelmapper.ModelMapper;
import org.modelmapper.TypeToken;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.List;
import java.util.Map;


@Service
@RequiredArgsConstructor
@Slf4j
public class ProductServiceImpl implements ProductService {

    private final ProductRepository productRepository;
    private final ModelMapper modelMapper;
    private final CategoryRepository categoryRepository;

    @Autowired
    private Cloudinary cloudinary;

    
    @Override
    public long countProducts() {
        return productRepository.count();
    }

    @Override
    public Response saveProduct(ProductDTO productDTO, MultipartFile imageFile) {

        Category category = categoryRepository.findById(productDTO.getCategoryId())
                .orElseThrow(() -> new NotFoundException("Category Not Found"));

        //map our dto to product entity
        Product productToSave = Product.builder()
                .name(productDTO.getName())
                .sku(productDTO.getSku())
                .price(productDTO.getPrice())
                .stockQuantity(productDTO.getStockQuantity())
                .description(productDTO.getDescription())
                .category(category)
                .build();

        if (imageFile != null && !imageFile.isEmpty()) {
            log.info("Image file exist");
            String imageUrl = uploadImageToCloudinary(imageFile);
            System.out.println("IMAGE URL IS: " + imageUrl);
            productToSave.setImageUrl(imageUrl);
        }

        //save the product entity
        productRepository.save(productToSave);

        return Response.builder()
                .status(200)
                .message("Product successfully saved")
                .build();
    }

    @Override
    public Response updateProduct(ProductDTO productDTO, MultipartFile imageFile) {

        //check if product exisit
        Product existingProduct = productRepository.findById(productDTO.getProductId())
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        //check if image is associated with the product to update and upload
        if (imageFile != null && !imageFile.isEmpty()) {
            String imageUrl = uploadImageToCloudinary(imageFile);
            System.out.println("IMAGE URL IS: " + imageUrl);
            existingProduct.setImageUrl(imageUrl);
        }

        //check if category is to be chanegd for the products
        if (productDTO.getCategoryId() != null && productDTO.getCategoryId() > 0) {
            Category category = categoryRepository.findById(productDTO.getCategoryId())
                    .orElseThrow(() -> new NotFoundException("Category Not Found"));
            existingProduct.setCategory(category);
        }

        //check if product fields is to be changed and update
        if (productDTO.getName() != null && !productDTO.getName().isBlank()) {
            existingProduct.setName(productDTO.getName());
        }

        if (productDTO.getSku() != null && !productDTO.getSku().isBlank()) {
            existingProduct.setSku(productDTO.getSku());
        }

        if (productDTO.getDescription() != null && !productDTO.getDescription().isBlank()) {
            existingProduct.setDescription(productDTO.getDescription());
        }

        if (productDTO.getPrice() != null && productDTO.getPrice().compareTo(BigDecimal.ZERO) >= 0) {
            existingProduct.setPrice(productDTO.getPrice());
        }

        if (productDTO.getStockQuantity() != null && productDTO.getStockQuantity() >= 0) {
            existingProduct.setStockQuantity(productDTO.getStockQuantity());
        }
        //update the product
        productRepository.save(existingProduct);

        //Build our response
        return Response.builder()
                .status(200)
                .message("Product Updated successfully")
                .build();


    }

    @Override
    public Response getAllProducts() {

        List<Product> productList = productRepository.findAll(Sort.by(Sort.Direction.DESC, "id"));

        List<ProductDTO> productDTOList = modelMapper.map(productList, new TypeToken<List<ProductDTO>>() {
        }.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    @Override
    public Response getProductById(Long id) {

        Product product = productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        return Response.builder()
                .status(200)
                .message("success")
                .product(modelMapper.map(product, ProductDTO.class))
                .build();
    }

    @Override
    public Response deleteProduct(Long id) {

        productRepository.findById(id)
                .orElseThrow(() -> new NotFoundException("Product Not Found"));

        productRepository.deleteById(id);

        return Response.builder()
                .status(200)
                .message("Product Deleted successfully")
                .build();
    }

    @Override
    public Response searchProduct(String input) {

        List<Product> products = productRepository.findByNameContainingOrDescriptionContaining(input, input);

        if (products.isEmpty()) {
            throw new NotFoundException("Product Not Found");
        }

        List<ProductDTO> productDTOList = modelMapper.map(products, new TypeToken<List<ProductDTO>>() {
        }.getType());

        return Response.builder()
                .status(200)
                .message("success")
                .products(productDTOList)
                .build();
    }

    // Ajoute cette méthode pour l'upload Cloudinary
    private String uploadImageToCloudinary(MultipartFile imageFile) {
        if (!imageFile.getContentType().startsWith("image/") || imageFile.getSize() > 1024 * 1024 * 1024) {
            throw new IllegalArgumentException("Only image files under 1GIG is allowed");
        }
        try {
            Map uploadResult = cloudinary.uploader().upload(imageFile.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString();
        } catch (IOException e) {
            throw new IllegalArgumentException("Erreur upload Cloudinary: " + e.getMessage());
        }
    }

    // Tu peux supprimer ou commenter saveImage et saveImage2 si tu n'en as plus besoin.
}
