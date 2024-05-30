FROM node

WORKDIR /app

# npm install의 정상 수행을 위해 컨테이너 내부에 패키지 모듈 명세 파일 복사
COPY package.json ./

RUN npm install

COPY ./ ./

EXPOSE 3000

CMD ["npm", "start"]