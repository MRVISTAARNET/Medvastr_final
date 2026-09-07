package com.medvastr.backend.exception;

import com.medvastr.backend.dto.ApiResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.*;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.*;
import java.util.*;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(org.springframework.transaction.UnexpectedRollbackException.class)
    public ResponseEntity<ApiResponse<Object>> unexpectedRollback(org.springframework.transaction.UnexpectedRollbackException e) {
        log.error("[CHECKOUT_ERROR] Unexpected Rollback Exception: ", e);
        
        String message = CheckoutErrorContext.getLastError();
        CheckoutErrorContext.clear();

        if (message == null || message.isBlank() || message.contains("marked as rollback-only") || message.contains("Transaction silently rolled back")) {
            Throwable mostSpecific = e.getMostSpecificCause();
            if (mostSpecific != null && mostSpecific.getMessage() != null 
                    && !mostSpecific.getMessage().contains("marked as rollback-only")
                    && !mostSpecific.getMessage().contains("Transaction silently rolled back")) {
                message = mostSpecific.getMessage();
            }
        }

        if (message == null || message.isBlank() || message.contains("marked as rollback-only") || message.contains("Transaction silently rolled back")) {
            Throwable current = e;
            while (current != null) {
                String m = current.getMessage();
                if (m != null && !m.isBlank() && !m.contains("marked as rollback-only") && !m.contains("Transaction silently rolled back")) {
                    message = m;
                    break;
                }
                if (current == current.getCause()) break;
                current = current.getCause();
            }
        }

        if (message == null || message.isBlank() || message.contains("marked as rollback-only") || message.contains("Transaction silently rolled back")) {
            message = "Payment API or order processing failed. Please verify RAZORPAY_KEY_ID & RAZORPAY_KEY_SECRET in Elastic Beanstalk Environment Variables.";
        }

        return ResponseEntity.badRequest().body(ApiResponse.err(message));
    }

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ApiResponse<Object>> runtime(RuntimeException e) {
        log.error("[CHECKOUT_ERROR] Runtime Exception: ", e);
        String ctxErr = CheckoutErrorContext.getLastError();
        CheckoutErrorContext.clear();
        String msg = (ctxErr != null && !ctxErr.isBlank()) ? ctxErr : e.getMessage();
        if (msg == null || msg.isBlank() || msg.contains("marked as rollback-only") || msg.contains("Transaction silently rolled back")) {
            msg = "Payment or order processing failed: " + (e.getCause() != null ? e.getCause().getMessage() : e.getMessage());
        }
        return ResponseEntity.badRequest().body(ApiResponse.err(msg));
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ApiResponse<Object>> badCreds(BadCredentialsException e) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(ApiResponse.err("Invalid email or password"));
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiResponse<Object>> access(AccessDeniedException e) {
        return ResponseEntity.status(HttpStatus.FORBIDDEN)
                .body(ApiResponse.err("Access Denied: You don't have permission to perform this action"));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse<Map<String, String>>> validation(MethodArgumentNotValidException e) {
        Map<String, String> errors = new LinkedHashMap<>();
        e.getBindingResult().getAllErrors().forEach(error -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });
        return ResponseEntity.badRequest().body(ApiResponse.<Map<String, String>>builder()
                .success(false)
                .message("Validation failed")
                .data(errors)
                .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ApiResponse<Object>> illegalArgument(IllegalArgumentException e) {
        return ResponseEntity.badRequest().body(ApiResponse.err(e.getMessage()));
    }

    @ExceptionHandler(org.springframework.web.method.annotation.MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ApiResponse<Object>> typeMismatch(
            org.springframework.web.method.annotation.MethodArgumentTypeMismatchException e) {
        String paramName = e.getName();
        String requiredType = e.getRequiredType() != null ? e.getRequiredType().getSimpleName() : "valid value";
        log.warn("Parameter type mismatch: '{}' should be a {}", paramName, requiredType);
        return ResponseEntity.badRequest()
                .body(ApiResponse.err("Invalid parameter: '" + paramName + "' must be a valid " + requiredType));
    }

    @ExceptionHandler(org.springframework.web.servlet.resource.NoResourceFoundException.class)
    public ResponseEntity<ApiResponse<Object>> noResource(
            org.springframework.web.servlet.resource.NoResourceFoundException e) {
        String path = e.getResourcePath();
        if (path != null && (path.contains("phpunit") || path.contains("ntlm") || path.contains("php") || path.contains("wp-") || path.contains("admin"))) {
            log.debug("Bot scan probe ignored: {}", path);
        } else {
            log.info("Static resource not found: {}", path);
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.err("Resource not found"));
    }

    @ExceptionHandler(org.springframework.web.servlet.NoHandlerFoundException.class)
    public ResponseEntity<ApiResponse<Object>> noHandler(
            org.springframework.web.servlet.NoHandlerFoundException e) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND)
                .body(ApiResponse.err("Route not found"));
    }

    @ExceptionHandler(org.springframework.web.HttpMediaTypeNotAcceptableException.class)
    public ResponseEntity<Void> mediaTypeNotAcceptable(org.springframework.web.HttpMediaTypeNotAcceptableException e) {
        return ResponseEntity.status(HttpStatus.NOT_ACCEPTABLE).build();
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiResponse<Object>> general(Exception e) {
        log.error("Unhandled Exception: ", e);
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(ApiResponse.err("Something went wrong on our end. Please try again later."));
    }
}
