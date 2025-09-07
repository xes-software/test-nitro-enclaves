use nix::sys::socket::{
    AddressFamily, Backlog, SockFlag, SockType, VsockAddr, accept, bind, listen, socket,
};
use nsm_io::Request;
use protocol_helpers::{recv_loop, recv_u64};
use serde_bytes::ByteBuf;
use std::env;
use std::os::fd::AsRawFd;

mod protocol_helpers;

const VMADDR_CID_ANY: u32 = 0xFFFFFFFF;
const BUF_MAX_LEN: usize = 8192;

fn main() -> Result<(), String> {
    let nsm_fd = nsm_driver::nsm_init();
    let public_key = ByteBuf::from("enclave");
    let hello = ByteBuf::from("hello, world!");
    let request = Request::Attestation {
        public_key: Some(public_key),
        user_data: Some(hello),
        nonce: None,
    };
    let response = nsm_driver::nsm_process_request(nsm_fd, request);
    println!("{:?}", response);
    nsm_driver::nsm_exit(nsm_fd);

    let mut port_option: Option<u32> = None;
    let mut args = env::args().skip(1);
    while let Some(arg) = args.next() {
        if arg == "--port" {
            if let Some(value) = args.next() {
                port_option = value.parse().ok()
            }
        }
    }

    let port = port_option.ok_or("Port was not passed in args (e.g. --port 5005).")?;

    let socket_fd = socket(
        AddressFamily::Vsock,
        SockType::Stream,
        SockFlag::empty(),
        None,
    )
    .map_err(|err| format!("Failed to build socket: {:?}", err))?;

    let addr = VsockAddr::new(VMADDR_CID_ANY, port);

    bind(socket_fd.as_raw_fd(), &addr).map_err(|err| format!("Vsock failed to bind: {:?}", err))?;

    listen(&socket_fd, Backlog::MAXCONN).expect("Vsock failed to listen.");

    loop {
        let vsock_fd =
            accept(socket_fd.as_raw_fd()).map_err(|err| format!("Accept failed: {:?}", err))?;

        let len = recv_u64(vsock_fd)?;
        let mut buf = [0u8; BUF_MAX_LEN];
        recv_loop(vsock_fd, &mut buf, len)?;
        println!(
            "{}",
            String::from_utf8(buf.to_vec())
                .map_err(|err| format!("The received bytes are not UTF-8: {:?}", err))?
        );
    }
}
