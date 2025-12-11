import bcrypt

def handler(request):
    password = "admin123"
    hashed = bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())
    return {"hash": hashed.decode('utf-8')}
