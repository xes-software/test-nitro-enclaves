use pallas::crypto::key::{
    self,
    ed25519::{SecretKey, SecretKeyExtended},
};
use std::process::Command;
use vsock::{VMADDR_CID_ANY, VsockAddr, VsockListener};

fn main() {
    let key = SecretKeyExtended::from_bytes([0u8; 64]);
    println!("Hello, world!");

    let listener =
        VsockListener::bind(&VsockAddr::new(VMADDR_CID_ANY, 8000)).expect("bind and listen failed");

    match listener.accept() {
        Ok((stream, addr)) => {
            println!(
                "Accepting connection on cid {} and port {}",
                addr.cid(),
                addr.port()
            );

            loop {}
        }
        Err(e) => {}
    }
}
