FROM node

WORKDIR /app

# npm install의 정상 수행을 위해 컨테이너 내부에 패키지 모듈 명세 파일 복사
COPY package.json /app/package.json
RUN npm install

COPY ./ ./
RUN chmod +x entrypoints/build.sh
RUN entrypoints/build.sh

ENV PORT=4000
EXPOSE ${PORT}

CMD ["npm", "start"]  