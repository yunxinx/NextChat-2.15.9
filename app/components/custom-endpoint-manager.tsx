import { useState, useEffect } from "react";
import styles from "./settings.module.scss";
import { useAccessStore } from "../store";
import { Select, List, ListItem, showToast } from "./ui-lib";
import { IconButton } from "./button";
import DeleteIcon from "../icons/delete.svg";
import EditIcon from "../icons/edit.svg";
import CopyIcon from "../icons/copy.svg";
import SaveIcon from "../icons/confirm.svg";
import { ServiceProvider, GoogleSafetySettingsThreshold } from "../constant";
import { useAppConfig } from "../store";

interface EndpointConfig {
  id: string;
  name: string;
  provider: ServiceProvider;
  // 通用设置
  customModels?: string;
  // OpenAI
  openaiApiKey?: string;
  openaiUrl?: string;
  // Azure
  azureApiKey?: string;
  azureApiVersion?: string;
  azureUrl?: string;
  // Google
  googleApiKey?: string;
  googleApiVersion?: string;
  googleUrl?: string;
  googleSafetySettings?: GoogleSafetySettingsThreshold;
  // Anthropic
  anthropicApiKey?: string;
  anthropicApiVersion?: string;
  anthropicUrl?: string;
  // Baidu
  baiduApiKey?: string;
  baiduSecretKey?: string;
  baiduUrl?: string;
  // ByteDance
  bytedanceApiKey?: string;
  bytedanceUrl?: string;
  // Alibaba
  alibabaApiKey?: string;
  alibabaUrl?: string;
  // Tencent
  tencentSecretId?: string;
  tencentSecretKey?: string;
  tencentUrl?: string;
  // Moonshot
  moonshotApiKey?: string;
  moonshotUrl?: string;
  // DeepSeek
  deepseekApiKey?: string;
  deepseekUrl?: string;
  // XAI
  xaiApiKey?: string;
  xaiUrl?: string;
  // ChatGLM
  chatglmApiKey?: string;
  chatglmUrl?: string;
  // SiliconFlow
  siliconflowApiKey?: string;
  siliconflowUrl?: string;
  // Stability
  stabilityApiKey?: string;
  stabilityUrl?: string;
  // Iflytek
  iflytekApiKey?: string;
  iflytekApiSecret?: string;
  iflytekUrl?: string;
}

export function CustomEndpointManager() {
  const accessStore = useAccessStore();
  const appConfig = useAppConfig();
  const [endpointConfigs, setEndpointConfigs] = useState<EndpointConfig[]>([]);
  const [selectedConfigId, setSelectedConfigId] = useState<string | null>(null);
  const [configName, setConfigName] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // 从localStorage加载保存的配置
  useEffect(() => {
    const savedConfigs = localStorage.getItem("custom-endpoints");
    if (savedConfigs) {
      try {
        const configs = JSON.parse(savedConfigs) as EndpointConfig[];
        setEndpointConfigs(configs);
      } catch (e) {
        console.error("Failed to parse saved endpoint configs:", e);
      }
    }
  }, []);

  // 保存配置到localStorage
  const saveConfigs = (configs: EndpointConfig[]) => {
    localStorage.setItem("custom-endpoints", JSON.stringify(configs));
    setEndpointConfigs(configs);
  };

  // 从当前accessStore状态创建新配置
  const createConfigFromCurrentState = (name: string): EndpointConfig => {
    const id = Date.now().toString();
    const appConfig = useAppConfig.getState();

    const config: EndpointConfig = {
      id,
      name,
      provider: accessStore.provider,
      // 保存自定义模型名称
      customModels: appConfig.customModels || "",
    };

    // 根据当前提供商类型保存相应的配置
    switch (accessStore.provider) {
      case ServiceProvider.OpenAI:
        config.openaiApiKey = accessStore.openaiApiKey;
        config.openaiUrl = accessStore.openaiUrl;
        break;
      case ServiceProvider.Azure:
        config.azureApiKey = accessStore.azureApiKey;
        config.azureApiVersion = accessStore.azureApiVersion;
        config.azureUrl = accessStore.azureUrl;
        break;
      case ServiceProvider.Google:
        config.googleApiKey = accessStore.googleApiKey;
        config.googleApiVersion = accessStore.googleApiVersion;
        config.googleUrl = accessStore.googleUrl;
        config.googleSafetySettings = accessStore.googleSafetySettings;
        break;
      case ServiceProvider.Anthropic:
        config.anthropicApiKey = accessStore.anthropicApiKey;
        config.anthropicApiVersion = accessStore.anthropicApiVersion;
        config.anthropicUrl = accessStore.anthropicUrl;
        break;
      case ServiceProvider.Baidu:
        config.baiduApiKey = accessStore.baiduApiKey;
        config.baiduSecretKey = accessStore.baiduSecretKey;
        config.baiduUrl = accessStore.baiduUrl;
        break;
      case ServiceProvider.ByteDance:
        config.bytedanceApiKey = accessStore.bytedanceApiKey;
        config.bytedanceUrl = accessStore.bytedanceUrl;
        break;
      case ServiceProvider.Alibaba:
        config.alibabaApiKey = accessStore.alibabaApiKey;
        config.alibabaUrl = accessStore.alibabaUrl;
        break;
      case ServiceProvider.Tencent:
        config.tencentSecretId = accessStore.tencentSecretId;
        config.tencentSecretKey = accessStore.tencentSecretKey;
        config.tencentUrl = accessStore.tencentUrl;
        break;
      case ServiceProvider.Moonshot:
        config.moonshotApiKey = accessStore.moonshotApiKey;
        config.moonshotUrl = accessStore.moonshotUrl;
        break;
      // case ServiceProvider.DeepSeek:
      //     config.deepseekApiKey = accessStore.deepseekApiKey;
      //     config.deepseekUrl = accessStore.deepseekUrl;
      //     break;
      case ServiceProvider.XAI:
        config.xaiApiKey = accessStore.xaiApiKey;
        config.xaiUrl = accessStore.xaiUrl;
        break;
      case ServiceProvider.ChatGLM:
        config.chatglmApiKey = accessStore.chatglmApiKey;
        config.chatglmUrl = accessStore.chatglmUrl;
        break;
      // case ServiceProvider.SiliconFlow:
      //     config.siliconflowApiKey = accessStore.siliconflowApiKey;
      //     config.siliconflowUrl = accessStore.siliconflowUrl;
      //     break;
      case ServiceProvider.Stability:
        config.stabilityApiKey = accessStore.stabilityApiKey;
        config.stabilityUrl = accessStore.stabilityUrl;
        break;
      case ServiceProvider.Iflytek:
        config.iflytekApiKey = accessStore.iflytekApiKey;
        config.iflytekApiSecret = accessStore.iflytekApiSecret;
        config.iflytekUrl = accessStore.iflytekUrl;
        break;
    }

    return config;
  };

  // 保存当前配置
  const saveCurrentConfig = () => {
    if (!configName.trim()) {
      showToast("请输入配置名称");
      return;
    }

    const newConfig = createConfigFromCurrentState(configName);

    if (isEditing && selectedConfigId) {
      // 更新现有配置
      const updatedConfigs = endpointConfigs.map((config) =>
        config.id === selectedConfigId
          ? { ...newConfig, id: selectedConfigId }
          : config,
      );
      saveConfigs(updatedConfigs);
      showToast("配置已更新");
    } else {
      // 创建新配置
      saveConfigs([...endpointConfigs, newConfig]);
      showToast("新配置已保存");
    }

    setConfigName("");
    setIsEditing(false);
    setSelectedConfigId(null);
  };

  // 应用选定的配置
  const applyConfig = (config: EndpointConfig) => {
    // 首先清空所有相关字段，避免配置混合
    accessStore.update((access) => {
      // 清空所有提供商的配置
      // OpenAI
      access.openaiApiKey = "";
      access.openaiUrl = "";
      // Azure
      access.azureApiKey = "";
      access.azureApiVersion = "";
      access.azureUrl = "";
      // Google
      access.googleApiKey = "";
      access.googleApiVersion = "";
      access.googleUrl = "";
      access.googleSafetySettings = GoogleSafetySettingsThreshold.BLOCK_NONE;
      // Anthropic
      access.anthropicApiKey = "";
      access.anthropicApiVersion = "";
      access.anthropicUrl = "";
      // Baidu
      access.baiduApiKey = "";
      access.baiduSecretKey = "";
      access.baiduUrl = "";
      // ByteDance
      access.bytedanceApiKey = "";
      access.bytedanceUrl = "";
      // Alibaba
      access.alibabaApiKey = "";
      access.alibabaUrl = "";
      // Tencent
      access.tencentSecretId = "";
      access.tencentSecretKey = "";
      access.tencentUrl = "";
      // Moonshot
      access.moonshotApiKey = "";
      access.moonshotUrl = "";
      // // DeepSeek
      // access.deepseekApiKey = "";
      // access.deepseekUrl = "";
      // XAI
      access.xaiApiKey = "";
      access.xaiUrl = "";
      // ChatGLM
      access.chatglmApiKey = "";
      access.chatglmUrl = "";
      // // SiliconFlow
      // access.siliconflowApiKey = "";
      // access.siliconflowUrl = "";
      // Stability
      access.stabilityApiKey = "";
      access.stabilityUrl = "";
      // Iflytek
      access.iflytekApiKey = "";
      access.iflytekApiSecret = "";
      access.iflytekUrl = "";

      // 然后设置新的提供商类型
      access.provider = config.provider;

      // 根据提供商类型设置相应的配置
      switch (config.provider) {
        case ServiceProvider.OpenAI:
          access.openaiApiKey = config.openaiApiKey || "";
          access.openaiUrl = config.openaiUrl || "";
          break;
        case ServiceProvider.Azure:
          access.azureApiKey = config.azureApiKey || "";
          access.azureApiVersion = config.azureApiVersion || "";
          access.azureUrl = config.azureUrl || "";
          break;
        case ServiceProvider.Google:
          access.googleApiKey = config.googleApiKey || "";
          access.googleApiVersion = config.googleApiVersion || "";
          access.googleUrl = config.googleUrl || "";
          access.googleSafetySettings =
            config.googleSafetySettings ||
            GoogleSafetySettingsThreshold.BLOCK_NONE;
          break;
        case ServiceProvider.Anthropic:
          access.anthropicApiKey = config.anthropicApiKey || "";
          access.anthropicApiVersion = config.anthropicApiVersion || "";
          access.anthropicUrl = config.anthropicUrl || "";
          break;
        case ServiceProvider.Baidu:
          access.baiduApiKey = config.baiduApiKey || "";
          access.baiduSecretKey = config.baiduSecretKey || "";
          access.baiduUrl = config.baiduUrl || "";
          break;
        case ServiceProvider.ByteDance:
          access.bytedanceApiKey = config.bytedanceApiKey || "";
          access.bytedanceUrl = config.bytedanceUrl || "";
          break;
        case ServiceProvider.Alibaba:
          access.alibabaApiKey = config.alibabaApiKey || "";
          access.alibabaUrl = config.alibabaUrl || "";
          break;
        case ServiceProvider.Tencent:
          access.tencentSecretId = config.tencentSecretId || "";
          access.tencentSecretKey = config.tencentSecretKey || "";
          access.tencentUrl = config.tencentUrl || "";
          break;
        case ServiceProvider.Moonshot:
          access.moonshotApiKey = config.moonshotApiKey || "";
          access.moonshotUrl = config.moonshotUrl || "";
          break;
        // case ServiceProvider.DeepSeek:
        //     access.deepseekApiKey = config.deepseekApiKey || "";
        //     access.deepseekUrl = config.deepseekUrl || "";
        //     break;
        case ServiceProvider.XAI:
          access.xaiApiKey = config.xaiApiKey || "";
          access.xaiUrl = config.xaiUrl || "";
          break;
        case ServiceProvider.ChatGLM:
          access.chatglmApiKey = config.chatglmApiKey || "";
          access.chatglmUrl = config.chatglmUrl || "";
          break;
        // case ServiceProvider.SiliconFlow:
        //     access.siliconflowApiKey = config.siliconflowApiKey || "";
        //     access.siliconflowUrl = config.siliconflowUrl || "";
        //     break;
        case ServiceProvider.Stability:
          access.stabilityApiKey = config.stabilityApiKey || "";
          access.stabilityUrl = config.stabilityUrl || "";
          break;
        case ServiceProvider.Iflytek:
          access.iflytekApiKey = config.iflytekApiKey || "";
          access.iflytekApiSecret = config.iflytekApiSecret || "";
          access.iflytekUrl = config.iflytekUrl || "";
          break;
      }
    });

    // 更新AppConfig中的自定义模型名称
    appConfig.update((appConfig) => {
      appConfig.customModels = config.customModels || "";
    });

    showToast(`已应用配置: ${config.name}`);
  };

  // 编辑配置
  const editConfig = (config: EndpointConfig) => {
    setConfigName(config.name);
    setSelectedConfigId(config.id);
    setIsEditing(true);
    applyConfig(config);
  };

  // 删除配置
  const deleteConfig = (id: string) => {
    const updatedConfigs = endpointConfigs.filter((config) => config.id !== id);
    saveConfigs(updatedConfigs);

    if (selectedConfigId === id) {
      setSelectedConfigId(null);
      setConfigName("");
      setIsEditing(false);
    }

    showToast("配置已删除");
  };

  // 复制配置
  const duplicateConfig = (config: EndpointConfig) => {
    const newConfig = {
      ...config,
      id: Date.now().toString(),
      name: `${config.name} (副本)`,
    };
    saveConfigs([...endpointConfigs, newConfig]);
    showToast("配置已复制");
  };

  // 清空当前所有配置参数
  const clearAllSettings = () => {
    // 清空所有相关字段
    accessStore.update((access) => {
      // 将提供商重置为默认值
      access.provider = ServiceProvider.OpenAI;

      // 清空所有提供商的配置
      // OpenAI
      access.openaiApiKey = "";
      access.openaiUrl = "";
      // Azure
      access.azureApiKey = "";
      access.azureApiVersion = "";
      access.azureUrl = "";
      // Google
      access.googleApiKey = "";
      access.googleApiVersion = "";
      access.googleUrl = "";
      access.googleSafetySettings = GoogleSafetySettingsThreshold.BLOCK_NONE;
      // Anthropic
      access.anthropicApiKey = "";
      access.anthropicApiVersion = "";
      access.anthropicUrl = "";
      // Baidu
      access.baiduApiKey = "";
      access.baiduSecretKey = "";
      access.baiduUrl = "";
      // ByteDance
      access.bytedanceApiKey = "";
      access.bytedanceUrl = "";
      // Alibaba
      access.alibabaApiKey = "";
      access.alibabaUrl = "";
      // Tencent
      access.tencentSecretId = "";
      access.tencentSecretKey = "";
      access.tencentUrl = "";
      // Moonshot
      access.moonshotApiKey = "";
      access.moonshotUrl = "";
      // // DeepSeek
      // access.deepseekApiKey = "";
      // access.deepseekUrl = "";
      // XAI
      access.xaiApiKey = "";
      access.xaiUrl = "";
      // ChatGLM
      access.chatglmApiKey = "";
      access.chatglmUrl = "";
      // // SiliconFlow
      // access.siliconflowApiKey = "";
      // access.siliconflowUrl = "";
      // Stability
      access.stabilityApiKey = "";
      access.stabilityUrl = "";
      // Iflytek
      access.iflytekApiKey = "";
      access.iflytekApiSecret = "";
      access.iflytekUrl = "";
    });

    // 清空AppConfig中的自定义模型名称
    appConfig.update((appConfig) => {
      appConfig.customModels = "";
    });

    // 重置编辑状态
    setConfigName("");
    setIsEditing(false);
    setSelectedConfigId(null);

    showToast("已清空所有配置参数");
  };

  return (
    <div className={styles["custom-endpoint-manager"]}>
      <List>
        <ListItem
          title="已保存的接口配置"
          subTitle="选择一个已保存的配置或创建新配置"
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              alignItems: "center",
              justifyContent: "flex-end",
            }}
          >
            <Select
              value={selectedConfigId || ""}
              onChange={(e) => {
                const selectedId = e.target.value;
                if (selectedId) {
                  const selectedConfig = endpointConfigs.find(
                    (config) => config.id === selectedId,
                  );
                  if (selectedConfig) {
                    applyConfig(selectedConfig);
                    setSelectedConfigId(selectedId);
                  }
                } else {
                  setSelectedConfigId(null);
                  clearAllSettings(); // 选择默认选项时清空所有参数
                }
              }}
              style={{ width: "300px", marginRight: "10px" }}
            >
              <option value="">-- 选择配置 --</option>
              {endpointConfigs.map((config) => (
                <option key={config.id} value={config.id}>
                  {config.name} ({config.provider})
                </option>
              ))}
            </Select>

            <div style={{ display: "flex", gap: "8px" }}>
              {selectedConfigId ? (
                <>
                  <IconButton
                    icon={<EditIcon />}
                    text="编辑"
                    onClick={() => {
                      const config = endpointConfigs.find(
                        (c) => c.id === selectedConfigId,
                      );
                      if (config) {
                        editConfig(config);
                      }
                    }}
                    bordered
                  />
                  <IconButton
                    icon={<CopyIcon />}
                    text="复制"
                    onClick={() => {
                      const config = endpointConfigs.find(
                        (c) => c.id === selectedConfigId,
                      );
                      if (config) {
                        duplicateConfig(config);
                      }
                    }}
                    bordered
                  />
                  <IconButton
                    icon={<DeleteIcon />}
                    text="删除"
                    onClick={() => {
                      if (selectedConfigId) {
                        deleteConfig(selectedConfigId);
                      }
                    }}
                    bordered
                  />
                </>
              ) : (
                <div style={{ width: "204px" }}></div> // 占位元素，保持布局一致
              )}
            </div>
          </div>
        </ListItem>

        <ListItem
          title="保存当前接口配置"
          subTitle={isEditing ? "更新现有配置" : "将当前接口设置保存为新配置"}
        >
          <div
            style={{
              display: "flex",
              width: "100%",
              justifyContent: "flex-end",
              alignItems: "center",
            }}
          >
            <input
              type="text"
              value={configName}
              placeholder="配置名称"
              onChange={(e) => setConfigName(e.target.value)}
              className={styles["endpoint-config-name-input"]}
              style={{ width: "380px", height: "38px", marginRight: "10px" }}
            />
            <IconButton
              icon={<SaveIcon />}
              text={isEditing ? "更新" : "保存"}
              onClick={saveCurrentConfig}
            />
            {isEditing && (
              <IconButton
                icon={<DeleteIcon />}
                text="取消"
                onClick={() => {
                  setIsEditing(false);
                  setSelectedConfigId(null);
                  setConfigName("");
                }}
              />
            )}
          </div>
        </ListItem>
      </List>
    </div>
  );
}
