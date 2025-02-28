use anchor_lang::prelude::*;

declare_id!("9uVWMyg6PGuLwWUYtA3vY2ubt6JiY5gJRcbHhCW4cXVz");

#[program]
pub mod solana_hello_api {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
