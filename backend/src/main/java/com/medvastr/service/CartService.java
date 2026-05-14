package com.medvastr.service;

import com.medvastr.dto.CartDTO;
import com.medvastr.dto.CartItemDTO;
import com.medvastr.dto.CartItemRequest;
import com.medvastr.dto.PromoResponse;
import com.medvastr.model.Cart;
import com.medvastr.model.CartItem;
import com.medvastr.model.Product;
import com.medvastr.model.PromoCode;
import com.medvastr.model.User;
import com.medvastr.repository.CartRepository;
import com.medvastr.repository.ProductRepository;
import com.medvastr.repository.PromoCodeRepository;
import com.medvastr.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Objects;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
@Slf4j
public class CartService {
    private static final BigDecimal FREE_SHIP = BigDecimal.valueOf(999);
    private static final BigDecimal SHIP_COST = BigDecimal.valueOf(99);

    private final CartRepository cartRepo;
    private final ProductRepository productRepo;
    private final PromoCodeRepository promoRepo;
    private final UserRepository userRepo;

    private User me() {
        return userRepo.findByEmail(SecurityContextHolder.getContext().getAuthentication().getName()).orElseThrow();
    }

    private Cart getOrCreate() {
        User u = me();
        return cartRepo.findByUser(u).orElseGet(() -> cartRepo.save(Cart.builder().user(u).build()));
    }

    public CartDTO getCart() {
        return toDTO(getOrCreate(), BigDecimal.ZERO);
    }

    public CartDTO addItem(CartItemRequest r) {
        Cart cart = getOrCreate();
        Product prod = productRepo.findById(r.getProductId()).orElseThrow(() -> new RuntimeException("Product not found"));

        String size = r.getSize() != null ? r.getSize() : "M";
        String color = r.getColorHex() != null ? r.getColorHex() : "";
        int qty = r.getQuantity() != null ? r.getQuantity() : 1;

        cart.getItems().stream()
            .filter(i ->
                i.getProduct().getId().equals(r.getProductId()) &&
                    Objects.equals(i.getSize(), size) &&
                    Objects.equals(i.getColorHex(), color)
            )
            .findFirst()
            .ifPresentOrElse(
                i -> i.setQuantity(i.getQuantity() + qty),
                () -> cart.getItems().add(
                    CartItem.builder()
                        .cart(cart)
                        .product(prod)
                        .size(size)
                        .colorHex(r.getColorHex())
                        .colorName(r.getColorName())
                        .quantity(qty)
                        .unitPrice(prod.getPrice())
                        .build()
                )
            );

        return toDTO(cartRepo.save(cart), BigDecimal.ZERO);
    }

    public CartDTO updateItem(Long id, Integer qty) {
        Cart c = getOrCreate();
        c.getItems().stream().filter(i -> i.getId().equals(id)).findFirst().ifPresent(i -> {
            if (qty <= 0) c.getItems().remove(i);
            else i.setQuantity(qty);
        });
        return toDTO(cartRepo.save(c), BigDecimal.ZERO);
    }

    public CartDTO removeItem(Long id) {
        Cart c = getOrCreate();
        c.getItems().removeIf(i -> i.getId().equals(id));
        return toDTO(cartRepo.save(c), BigDecimal.ZERO);
    }

    public void clearCart() {
        Cart c = getOrCreate();
        c.getItems().clear();
        cartRepo.save(c);
    }

    public PromoResponse validatePromo(String code, Double total) {
        return promoRepo.findByCodeIgnoreCaseAndActiveTrue(code).map(pc -> {
            BigDecimal t = BigDecimal.valueOf(total);
            if (pc.getMinimumOrderAmount() != null && t.compareTo(pc.getMinimumOrderAmount()) < 0) {
                return PromoResponse.builder()
                    .valid(false)
                    .message("Minimum order INR " + pc.getMinimumOrderAmount() + " required")
                    .build();
            }

            BigDecimal d = pc.getDiscountType() == PromoCode.DiscountType.PERCENTAGE
                ? t.multiply(pc.getDiscountValue()).divide(BigDecimal.valueOf(100))
                : pc.getDiscountValue();

            if (pc.getMaximumDiscountAmount() != null && d.compareTo(pc.getMaximumDiscountAmount()) > 0) d = pc.getMaximumDiscountAmount();

            return PromoResponse.builder()
                .valid(true)
                .message(pc.getCode() + " applied!")
                .discountAmount(d)
                .discountType(pc.getDiscountType().name())
                .discountValue(pc.getDiscountValue())
                .build();
        }).orElse(PromoResponse.builder().valid(false).message("Invalid or expired promo code").build());
    }

    private CartDTO toDTO(Cart cart, BigDecimal disc) {
        BigDecimal sub = cart.getItems().stream()
            .map(i -> i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
            .reduce(BigDecimal.ZERO, BigDecimal::add);

        BigDecimal ship = sub.compareTo(FREE_SHIP) >= 0 ? BigDecimal.ZERO : SHIP_COST;

        return CartDTO.builder()
            .items(cart.getItems().stream()
                .map(i -> CartItemDTO.builder()
                    .id(i.getId())
                    .productId(i.getProduct().getId())
                    .productName(i.getProduct().getName())
                    .emoji(i.getProduct().getEmoji())
                    .bgColor(i.getProduct().getBgColor())
                    .size(i.getSize())
                    .colorName(i.getColorName())
                    .colorHex(i.getColorHex())
                    .quantity(i.getQuantity())
                    .unitPrice(i.getUnitPrice())
                    .totalPrice(i.getUnitPrice().multiply(BigDecimal.valueOf(i.getQuantity())))
                    .build())
                .collect(Collectors.toList()))
            .subtotal(sub)
            .shipping(ship)
            .discount(disc)
            .total(sub.add(ship).subtract(disc))
            .itemCount(cart.getItems().stream().mapToInt(CartItem::getQuantity).sum())
            .freeShipping(ship.compareTo(BigDecimal.ZERO) == 0)
            .amountToFreeShipping(FREE_SHIP.subtract(sub).max(BigDecimal.ZERO))
            .build();
    }
}
