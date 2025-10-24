use pallas::crypto::key::{
    self,
    ed25519::{SecretKey, SecretKeyExtended},
};
use std::process::Command;

fn main() {
    let key = SecretKeyExtended::from_bytes([0u8; 64]);
    println!("Hello, world!");
}
