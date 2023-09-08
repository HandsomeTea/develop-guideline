日志需要的环境变量：
    SERVER_NAME 当前nodejs服务的名称
    LOG_LEVEL 默认的日志级别
    DEV_LOG_LEVEL  开发日志的日志级别，如果取不到，会取LOG_LEVEL值，如果取不到LOG_LEVEL值，将会关闭开发日志的打印
    TRACE_LOG_LEVEL  追踪日志的日志级别，如果取不到，会取LOG_LEVEL值，如果取不到LOG_LEVEL值，将会打印所有追踪日志
    AUDIT_LOG_LEVEL 审计检查日志的日志级别，如果取不到，会取LOG_LEVEL值，如果取不到LOG_LEVEL值，将会打印所有追踪日志
