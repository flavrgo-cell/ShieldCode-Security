//! ShieldCode B2B Anti-Phishing Code API Vault
//!
//! Strictly decoupled Clean Architecture / Domain-Driven Design (DDD):
//! - `domain`: Pure business entities, value objects, and trait ports (zero framework/DB dependencies).
//! - `application`: Use cases orchestrating domain rules, cryptography ports, and repository ports.
//! - `crypto`: Memory-safe AEAD (`AES-256-GCM`), `HKDF-SHA256` per-tenant key derivation, and `HMAC-SHA256` blind indexing.
//! - `infrastructure`: PostgreSQL persistence adapter (`sqlx`).
//! - `api`: `axum` HTTP transport layer, DTOs, and B2B tenant authentication extractors.

#![forbid(unsafe_code)]
#![warn(clippy::all, rust_2018_idioms)]

pub mod api;
pub mod application;
pub mod config;
pub mod crypto;
pub mod domain;
pub mod error;
pub mod infrastructure;
