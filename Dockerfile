FROM docker.m.daocloud.io/library/node:20-bullseye

RUN apt-get update && apt-get install -y \
    openjdk-17-jdk \
    unzip \
    git \
    wget \
    && rm -rf /var/lib/apt/lists/*

ENV ANDROID_SDK_ROOT=/opt/android-sdk
ENV PATH=$ANDROID_SDK_ROOT/cmdline-tools/latest/bin:$ANDROID_SDK_ROOT/platform-tools:$PATH

RUN mkdir -p $ANDROID_SDK_ROOT/cmdline-tools

# 使用较稳定版本号
RUN wget https://dl.google.com/android/repository/commandlinetools-linux-9477386_latest.zip -O cmdline-tools.zip

RUN unzip cmdline-tools.zip -d $ANDROID_SDK_ROOT/cmdline-tools
RUN mv $ANDROID_SDK_ROOT/cmdline-tools/cmdline-tools \
       $ANDROID_SDK_ROOT/cmdline-tools/latest

RUN yes | sdkmanager --licenses

RUN sdkmanager \
    "platform-tools" \
    "platforms;android-34" \
    "build-tools;34.0.0"

# =========================
# 4️⃣ 工作目录
# =========================
# 启用 yarn
RUN corepack enable
RUN corepack prepare yarn@stable --activate

WORKDIR /app

# 只复制依赖文件
COPY package.json yarn.lock ./

RUN yarn install --immutable

# 再复制其余文件
COPY . .

WORKDIR /app/androidv

RUN ./gradlew clean

CMD ["./gradlew", "assembleRelease"]
