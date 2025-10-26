#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env, String, symbol_short, IntoVal};

#[derive(Clone)]
#[contracttype]
pub enum DataKey {
    Username(Address),
}

#[contract]
pub struct UsernameNFT;

#[contractimpl]
impl UsernameNFT {
    /// Claim a username for the given address
    /// Parameters:
    /// - owner: The address claiming the username
    /// - username: The desired username (3-20 characters)
    pub fn claim_username(env: Env, owner: Address, username: String) {
        // Require authorization from the owner for this specific call
        // In SDK 21.7.0, we need to authorize with context
        owner.require_auth_for_args((username.clone(),).into_val(&env));
        
        // Validate username length
        let username_len = username.len();
        if username_len < 3 || username_len > 20 {
            panic!("Username must be 3-20 characters");
        }
        
        // Check if this address already has a username
        let key = DataKey::Username(owner.clone());
        if env.storage().instance().has(&key) {
            panic!("Address already has a username");
        }
        
        // Store the username for this address
        env.storage().instance().set(&key, &username);
        
        // Extend storage TTL to 1 year (31536000 ledgers ≈ 1 year at 5s/ledger)
        env.storage().instance().extend_ttl(100, 31536000);
        
        // Emit event
        env.events().publish((symbol_short!("claimed"),), (owner, username));
    }
    
    /// Get the username for a given address
    /// Returns None if no username is set
    pub fn get_username(env: Env, address: Address) -> Option<String> {
        let key = DataKey::Username(address);
        env.storage().instance().get(&key)
    }
    
    /// Change the username for the given address
    pub fn change_username(env: Env, owner: Address, new_username: String) {
        // Require authorization from the owner for this specific call
        owner.require_auth_for_args((new_username.clone(),).into_val(&env));
        
        // Validate username length
        let username_len = new_username.len();
        if username_len < 3 || username_len > 20 {
            panic!("Username must be 3-20 characters");
        }
        
        // Check if this address has a username to change
        let key = DataKey::Username(owner.clone());
        if !env.storage().instance().has(&key) {
            panic!("No username to change");
        }
        
        // Update the username
        env.storage().instance().set(&key, &new_username);
        
        // Extend storage TTL to 1 year
        env.storage().instance().extend_ttl(100, 31536000);
        
        // Emit event
        env.events().publish((symbol_short!("changed"),), (owner, new_username));
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn test_claim_and_get_username() {
        let env = Env::default();
        let contract_id = env.register_contract(None, UsernameNFT);
        let client = UsernameNFTClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        let username = String::from_str(&env, "spookygamer");

        // Claim username
        env.mock_all_auths();
        client.claim_username(&user, &username);

        // Get username
        let stored = client.get_username(&user);
        assert_eq!(stored, Some(username));
    }
    
    #[test]
    fn test_change_username() {
        let env = Env::default();
        let contract_id = env.register_contract(None, UsernameNFT);
        let client = UsernameNFTClient::new(&env, &contract_id);

        let user = Address::generate(&env);
        env.mock_all_auths();
        
        // Claim first
        client.claim_username(&user, &String::from_str(&env, "oldname"));
        
        // Change
        client.change_username(&user, &String::from_str(&env, "newname"));
        
        // Verify
        let stored = client.get_username(&user);
        assert_eq!(stored, Some(String::from_str(&env, "newname")));
    }
}
