## Description

This is server for api testing. use nestjs framework and typescript

## Feature

- 概念
  - task: 接口自动化按照任务去配置，一个任务下可配置多个场景或多个模块
  - module: 被测系统的模块划分，比如一个系统内的登录模块，模块下可配置关联多个场景
  - scene: 表示实际一个业务场景，比如 登录-创建订单-删除订单 算一个场景，场景是自动化执行器运行的基本单位，scene可以关联scene-data作为外部输入数据，一个场景由多个case组成
  - scene-data: 表示测试数据，可以在场景中进行关联 
  - case: 表示一个接口用例，按照模块划分，一个接口用例包含前置操作，接口调用，超时重试控制，接口断言，接口数据提取，后置处理，结果存储等节点
- 支持功能
  - 支持任务异步执行
  - 支持结果查看
  - 支持场景接口的内部数据参数化和外都数据参数化
  - 用例模块-断言/请求数据/提取 支持引用数据文件
  - 通过配置一次任务就可直接运行

## Installation

```bash
$ npm install
```

## Running the app

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Test

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```