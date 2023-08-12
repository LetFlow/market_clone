from fastapi import FastAPI,UploadFile,Form,Response,Depends
from fastapi.responses import JSONResponse
from fastapi.encoders import jsonable_encoder
from fastapi.staticfiles import StaticFiles
from fastapi_login import LoginManager
from fastapi_login.exceptions import InvalidCredentialsException
from typing import Annotated
import sqlite3

con = sqlite3.connect('db.db',check_same_thread=False)
cur = con.cursor()

cur.execute(f"""
            CREATE TABLE IF NOT EXISTS items 
            (id  integer primary key,
            title text not null,
            image blob,
            price integer not null,
            description text, 
            place text not null,
            timeAt INTEGER);
            """)

app = FastAPI()

SECRET = 'super-coding'

manager = LoginManager(SECRET,'/login')

@manager.user_loader() # 쿼리 유저 할때 로그인 메니저가 키를 같이 조회한다.
def query_user(data):
    WHERE_STATEMENTS = f'id ="{data}"'
    if type(data) == dict : 
        WHERE_STATEMENTS = f'''id = "{data["id"]}"'''
        
    con.row_factory = sqlite3.Row
    cur=con.cursor()
    user = cur.execute(f""" 
                       select * from users where {WHERE_STATEMENTS}
                       """).fetchone()
    return user

@app.post('/login')
def login(
    id:Annotated[str,Form()],
           password:Annotated[str,Form()]):
    user = query_user(id)
    if not user : 
        raise InvalidCredentialsException
    elif password != user['password']:
        raise InvalidCredentialsException
    
    access_token = manager.create_access_token(data={
        'sub': {
         'id':user['id'],
        'name':user['name'],
        'email':user['email']
       }
    })
    return {'access_token':access_token}

@app.post('/signup')
def signup(id:Annotated[str,Form()],
           password:Annotated[str,Form()],
           name:Annotated[str,Form()],
           email:Annotated[str,Form()]):
    
    cur.execute(f"""
                insert into users(id,name,email,password)
                values('{id}','{name}','{email}','{password}')
                """)
    con.commit()
    return '200'
    
    
    print(id,password)
    return '200'

@app.post('/items')
async def create_item(image:UploadFile,
                title:Annotated[str,Form()], 
                price:Annotated[int,Form()], 
                description: Annotated[str,Form()],
                place: Annotated[str,Form()],
                timeAt:Annotated[int,Form()]
                ):
    
    image_bytes = await image.read()
    cur.execute(f"""
                insert into 
                items(title, image, price, description, place,timeAt) 
                values('{title}','{image_bytes.hex()}',{price},'{description}','{place}',{timeAt})
                """)
    con.commit()
    return '200'

@app.get('/items')
async def get_itmes(user=Depends(manager)):
    con.row_factory = sqlite3.Row
    # 컬럼명도 같이 가져옴
    cur=con.cursor()
    rows = cur.execute(f"""
                       select * from items;
                       """).fetchall()
    return JSONResponse(jsonable_encoder(dict(row) for row in rows))


@app.get('/images/{item_id}')
async def get_image(item_id):
    cur = con.cursor()
    #16진법
    image_bytes = cur.execute(f"""
                              select image from items where id = {item_id}
                              """).fetchone()[0]
    return Response(content = bytes.fromhex(image_bytes),media_type='image/*')





app.mount("/", StaticFiles(directory="frontend",html=True),name="frontend")