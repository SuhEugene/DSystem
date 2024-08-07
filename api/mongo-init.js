db.createUser(
    {
        user: _getEnv("DB_USER"),
        pwd: _getEnv("DB_PASSWORD"),
        roles: [
            {
                role: "readWrite",
                db: _getEnv("DB_NAME")
            },
        ],
    },
);
