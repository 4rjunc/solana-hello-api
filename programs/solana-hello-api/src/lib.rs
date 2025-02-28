use anchor_lang::prelude::*;

declare_id!("9uVWMyg6PGuLwWUYtA3vY2ubt6JiY5gJRcbHhCW4cXVz");

#[program]
pub mod solana_hello_api {
    use super::*;
    pub fn hello(_ctx: Context<Hello>) -> Result<()> {
        msg!("Hello. World");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Hello {}
