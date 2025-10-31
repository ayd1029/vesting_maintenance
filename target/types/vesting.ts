/**
 * Program IDL in camelCase format in order to be used in JS/TS.
 *
 * Note that this is only a type helper and is not the actual IDL. The original
 * IDL can be found at `target/idl/vesting.json`.
 */
export type Vesting = {
  "address": "DcjmKSSKNxbSAwBQZx8wSAhosxBxQoyz3DdXuysMiPTy",
  "metadata": {
    "name": "vesting",
    "version": "0.1.0",
    "spec": "0.1.0",
    "description": "Created with Anchor"
  },
  "instructions": [
    {
      "name": "appendYearlyPlan",
      "discriminator": [
        246,
        108,
        234,
        236,
        199,
        128,
        43,
        170
      ],
      "accounts": [
        {
          "name": "vestingAccount",
          "writable": true
        },
        {
          "name": "planChunk",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vestingAccount"
              }
            ]
          }
        },
        {
          "name": "parentPlanChunk",
          "writable": true,
          "optional": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "plans",
          "type": {
            "vec": {
              "defined": {
                "name": "yearlyPlan"
              }
            }
          }
        }
      ]
    },
    {
      "name": "closeVestingAccount",
      "discriminator": [
        205,
        108,
        128,
        126,
        240,
        179,
        18,
        220
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "vestingAccount",
          "writable": true
        },
        {
          "name": "planChunk",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vestingAccount"
              }
            ]
          }
        },
        {
          "name": "beneficiaryVault"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "createVesting",
      "discriminator": [
        135,
        184,
        171,
        156,
        197,
        162,
        246,
        44
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "beneficiary"
        },
        {
          "name": "vestingAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "params.vesting_id"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "parentVault",
          "writable": true
        },
        {
          "name": "beneficiaryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "params.vesting_id"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenVault"
              }
            ]
          }
        },
        {
          "name": "beneficiaryTokenAccount",
          "writable": true
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "vestingParams"
            }
          }
        }
      ]
    },
    {
      "name": "doVesting",
      "discriminator": [
        233,
        226,
        12,
        16,
        184,
        217,
        141,
        59
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "vaultAuthority"
        },
        {
          "name": "originTokenAccount",
          "writable": true
        },
        {
          "name": "destinationTokenAccount",
          "writable": true
        },
        {
          "name": "vestingAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "params.vesting_id"
              }
            ]
          }
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "planChunk",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "vestingAccount"
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "beneficiary"
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        },
        {
          "name": "vestingTime",
          "type": "i64"
        },
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "vestingParams"
            }
          }
        }
      ]
    },
    {
      "name": "emergencyStop",
      "discriminator": [
        179,
        143,
        200,
        137,
        108,
        245,
        248,
        35
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "beneficiary"
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "vestingAccount",
          "writable": true
        }
      ],
      "args": []
    },
    {
      "name": "initTokenInfo",
      "discriminator": [
        191,
        130,
        135,
        59,
        244,
        52,
        37,
        100
      ],
      "accounts": [
        {
          "name": "schedulerAdmin",
          "writable": true,
          "signer": true
        },
        {
          "name": "tokenInfo",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "schedulerAdmin"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "args",
          "type": {
            "defined": {
              "name": "tokenInfoArgs"
            }
          }
        }
      ]
    },
    {
      "name": "initialize",
      "discriminator": [
        175,
        175,
        109,
        31,
        13,
        152,
        155,
        237
      ],
      "accounts": [
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "deployerAdmin",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  108,
                  111,
                  121,
                  95,
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "adminConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "initializeDeployer",
      "discriminator": [
        148,
        104,
        3,
        122,
        127,
        192,
        10,
        1
      ],
      "accounts": [
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "deployAdmin",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  108,
                  111,
                  121,
                  95,
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": []
    },
    {
      "name": "lockupVault",
      "discriminator": [
        27,
        108,
        75,
        80,
        73,
        39,
        186,
        192
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true
        },
        {
          "name": "schedulerAdmin",
          "writable": true
        },
        {
          "name": "adminTokenAccount",
          "writable": true
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "schedulerAdmin"
              },
              {
                "kind": "account",
                "path": "tokenVault"
              }
            ]
          }
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "amount",
          "type": "u64"
        }
      ]
    },
    {
      "name": "removeAdmin",
      "discriminator": [
        74,
        202,
        71,
        106,
        252,
        31,
        72,
        183
      ],
      "accounts": [
        {
          "name": "deployer",
          "writable": true,
          "signer": true
        },
        {
          "name": "deployerAdmin",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  100,
                  101,
                  112,
                  108,
                  111,
                  121,
                  95,
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "admin",
          "writable": true
        },
        {
          "name": "adminConfig",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        }
      ],
      "args": []
    },
    {
      "name": "updatePlanChunk",
      "discriminator": [
        214,
        7,
        219,
        254,
        74,
        66,
        181,
        102
      ],
      "accounts": [
        {
          "name": "planChunk",
          "writable": true
        },
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        }
      ],
      "args": [
        {
          "name": "plans",
          "type": {
            "vec": {
              "defined": {
                "name": "yearlyPlan"
              }
            }
          }
        }
      ]
    },
    {
      "name": "userCreateVesting",
      "discriminator": [
        80,
        11,
        183,
        60,
        236,
        81,
        101,
        224
      ],
      "accounts": [
        {
          "name": "admin",
          "writable": true,
          "signer": true,
          "relations": [
            "adminConfig"
          ]
        },
        {
          "name": "adminConfig",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  97,
                  100,
                  109,
                  105,
                  110
                ]
              }
            ]
          }
        },
        {
          "name": "tokenInfo",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  116,
                  111,
                  107,
                  101,
                  110,
                  95,
                  105,
                  110,
                  102,
                  111
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              }
            ]
          }
        },
        {
          "name": "beneficiary"
        },
        {
          "name": "vestingAccount",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  101,
                  115,
                  116,
                  105,
                  110,
                  103
                ]
              },
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "params.vesting_id"
              }
            ]
          }
        },
        {
          "name": "tokenMint"
        },
        {
          "name": "tokenVault",
          "writable": true
        },
        {
          "name": "parentVault",
          "writable": true
        },
        {
          "name": "beneficiaryVault",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116
                ]
              },
              {
                "kind": "account",
                "path": "beneficiary"
              },
              {
                "kind": "account",
                "path": "tokenMint"
              },
              {
                "kind": "arg",
                "path": "params.vesting_id"
              }
            ]
          }
        },
        {
          "name": "vaultAuthority",
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  118,
                  97,
                  117,
                  108,
                  116,
                  95,
                  97,
                  117,
                  116,
                  104
                ]
              },
              {
                "kind": "account",
                "path": "admin"
              },
              {
                "kind": "account",
                "path": "tokenVault"
              }
            ]
          }
        },
        {
          "name": "beneficiaryTokenAccount",
          "writable": true
        },
        {
          "name": "parentVestingAccount",
          "writable": true
        },
        {
          "name": "parentPlanChunk",
          "writable": true,
          "pda": {
            "seeds": [
              {
                "kind": "const",
                "value": [
                  112,
                  108,
                  97,
                  110,
                  115
                ]
              },
              {
                "kind": "account",
                "path": "parentVestingAccount"
              }
            ]
          }
        },
        {
          "name": "systemProgram",
          "address": "11111111111111111111111111111111"
        },
        {
          "name": "tokenProgram",
          "address": "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
        },
        {
          "name": "rent",
          "address": "SysvarRent111111111111111111111111111111111"
        }
      ],
      "args": [
        {
          "name": "params",
          "type": {
            "defined": {
              "name": "vestingParams"
            }
          }
        }
      ]
    }
  ],
  "accounts": [
    {
      "name": "adminConfig",
      "discriminator": [
        156,
        10,
        79,
        161,
        71,
        9,
        62,
        77
      ]
    },
    {
      "name": "deployAdmin",
      "discriminator": [
        129,
        83,
        22,
        34,
        99,
        160,
        220,
        147
      ]
    },
    {
      "name": "tokenInfo",
      "discriminator": [
        109,
        162,
        52,
        125,
        77,
        166,
        37,
        202
      ]
    },
    {
      "name": "vestingAccount",
      "discriminator": [
        102,
        73,
        10,
        233,
        200,
        188,
        228,
        216
      ]
    },
    {
      "name": "vestingPlanChunk",
      "discriminator": [
        17,
        84,
        141,
        114,
        248,
        103,
        149,
        175
      ]
    }
  ],
  "errors": [
    {
      "code": 6000,
      "name": "vestingNotReached",
      "msg": "Veseting period has not ended yet"
    },
    {
      "code": 6001,
      "name": "noTokensToRelease",
      "msg": "No tokens available for release"
    },
    {
      "code": 6002,
      "name": "unauthorized",
      "msg": "Unauthorized operation"
    },
    {
      "code": 6003,
      "name": "notActive",
      "msg": "Vesting is not active"
    },
    {
      "code": 6004,
      "name": "invalidParameters",
      "msg": "Invalid vesting parameters"
    },
    {
      "code": 6005,
      "name": "overflow",
      "msg": "Add amount is overflow"
    },
    {
      "code": 6006,
      "name": "notDeployAdmin",
      "msg": "You are not the deployer admin."
    },
    {
      "code": 6007,
      "name": "parentPlanNotFound",
      "msg": "No parent vesting plan found."
    },
    {
      "code": 6008,
      "name": "insufficientAmount",
      "msg": "Insufficient amount in the parent vesting plan."
    },
    {
      "code": 6009,
      "name": "alreadyReleased",
      "msg": "Vesting for the specified time has already been completed."
    },
    {
      "code": 6010,
      "name": "invalidToken",
      "msg": "Token not registered in token_info."
    },
    {
      "code": 6011,
      "name": "vaultNotEmpty",
      "msg": "Vault must be empty before closing the vesting account."
    },
    {
      "code": 6012,
      "name": "invalidMint",
      "msg": "Invalid Mint"
    }
  ],
  "types": [
    {
      "name": "adminConfig",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "admin",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "deployAdmin",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "deployer",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokenInfo",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "tokenSymbol",
            "type": "string"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "mintWalletAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "tokenInfoArgs",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "tokenName",
            "type": "string"
          },
          {
            "name": "tokenSymbol",
            "type": "string"
          },
          {
            "name": "totalSupply",
            "type": "u64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "mintWalletAddress",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vestingAccount",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "beneficiary",
            "type": "pubkey"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "releasedAmount",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "lastReleaseTime",
            "type": "i64"
          },
          {
            "name": "tokenMint",
            "type": "pubkey"
          },
          {
            "name": "tokenVault",
            "type": "pubkey"
          },
          {
            "name": "beneficiaryVault",
            "type": "pubkey"
          },
          {
            "name": "category",
            "type": "string"
          },
          {
            "name": "isActive",
            "type": "bool"
          },
          {
            "name": "destinationTokenAccount",
            "type": "pubkey"
          },
          {
            "name": "parentVault",
            "type": "pubkey"
          }
        ]
      }
    },
    {
      "name": "vestingParams",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vestingId",
            "type": "u64"
          },
          {
            "name": "totalAmount",
            "type": "u64"
          },
          {
            "name": "releasedAmount",
            "type": "u64"
          },
          {
            "name": "startTime",
            "type": "i64"
          },
          {
            "name": "endTime",
            "type": "i64"
          },
          {
            "name": "category",
            "type": "string"
          }
        ]
      }
    },
    {
      "name": "vestingPlanChunk",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "vestingAccount",
            "type": "pubkey"
          },
          {
            "name": "plans",
            "type": {
              "vec": {
                "defined": {
                  "name": "yearlyPlan"
                }
              }
            }
          }
        ]
      }
    },
    {
      "name": "yearlyPlan",
      "type": {
        "kind": "struct",
        "fields": [
          {
            "name": "releaseTime",
            "type": "i64"
          },
          {
            "name": "amount",
            "type": "u64"
          },
          {
            "name": "released",
            "type": "bool"
          }
        ]
      }
    }
  ]
};
