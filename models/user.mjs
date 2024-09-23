class User {
    constructor(id, email, name, password_hash) {
        this.id = id;
        this.email = email;
        this.name = name;
        this.password_hash = password_hash;
    }
}

export { User };
