FROM psblr.jfrog.io/worksafeperm-docker-virtual/node:20-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# node_modules is pre-built in the pipeline via 'jf npm install'
# and copied straight into the image — no npm install here
COPY node_modules ./node_modules

# Copy application source
COPY helloworld.js .

EXPOSE 3000

CMD ["node", "helloworld.js"]
