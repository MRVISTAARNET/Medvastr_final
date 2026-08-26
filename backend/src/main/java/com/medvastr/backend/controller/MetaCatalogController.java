package com.medvastr.backend.controller;

import com.medvastr.backend.model.Product;
import com.medvastr.backend.model.ProductImage;
import com.medvastr.backend.repository.ProductRepository;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/catalog")
public class MetaCatalogController {

    private final ProductRepository productRepository;

    public MetaCatalogController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @GetMapping(value = "/meta.xml", produces = MediaType.APPLICATION_XML_VALUE)
    public ResponseEntity<String> getMetaCatalogXml() {
        List<Product> products = productRepository.findAll().stream()
                .filter(Product::isActive)
                .toList();

        StringBuilder xml = new StringBuilder();
        xml.append("<?xml version=\"1.0\" encoding=\"UTF-8\"?>\n");
        xml.append("<rss version=\"2.0\" xmlns:g=\"http://base.google.com/ns/1.0\">\n");
        xml.append("  <channel>\n");
        xml.append("    <title>Medvarn Official Product Catalog</title>\n");
        xml.append("    <link>https://www.medvarn.com</link>\n");
        xml.append("    <description>Premium Medical Apparel, Surgical Scrubs, and Healthcare Uniforms</description>\n");

        for (Product p : products) {
            String productUrl = "https://www.medvarn.com/product/" + (p.getSlug() != null ? p.getSlug() : p.getId());
            String imageUrl = "https://d2tnzshqdaedbc.cloudfront.net/women-scrub-1.jpg"; // Default fallback

            if (p.getImages() != null && !p.getImages().isEmpty()) {
                ProductImage firstImg = p.getImages().iterator().next();
                if (firstImg != null && firstImg.getImageUrl() != null) {
                    imageUrl = firstImg.getImageUrl();
                }
            }

            BigDecimal price = p.getPrice() != null ? p.getPrice() : BigDecimal.valueOf(599);

            xml.append("    <item>\n");
            xml.append("      <g:id>").append(p.getId()).append("</g:id>\n");
            xml.append("      <g:title>").append(escapeXml(p.getName())).append("</g:title>\n");
            xml.append("      <g:description>").append(escapeXml(p.getDescription() != null ? p.getDescription() : p.getName())).append("</g:description>\n");
            xml.append("      <g:link>").append(escapeXml(productUrl)).append("</g:link>\n");
            xml.append("      <g:image_link>").append(escapeXml(imageUrl)).append("</g:image_link>\n");
            xml.append("      <g:brand>Medvarn</g:brand>\n");
            xml.append("      <g:condition>new</g:condition>\n");
            xml.append("      <g:availability>in_stock</g:availability>\n");
            xml.append("      <g:price>").append(price).append(" INR</g:price>\n");
            xml.append("      <g:google_product_category>Apparel &amp; Accessories &gt; Uniforms &gt; Medical Uniforms</g:google_product_category>\n");
            xml.append("    </item>\n");
        }

        xml.append("  </channel>\n");
        xml.append("</rss>");

        HttpHeaders headers = new HttpHeaders();
        headers.set(HttpHeaders.CONTENT_TYPE, "application/xml; charset=UTF-8");
        return new ResponseEntity<>(xml.toString(), headers, HttpStatus.OK);
    }

    private String escapeXml(String input) {
        if (input == null) return "";
        return input.replace("&", "&amp;")
                    .replace("<", "&lt;")
                    .replace(">", "&gt;")
                    .replace("\"", "&quot;")
                    .replace("'", "&apos;");
    }
}
