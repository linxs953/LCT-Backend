## 基于go编写的自动化测试任务的执行调度器


- 监听kafka消息
- 启动一个goroutine去运行单个场景，并将结果通过kafka回传给server