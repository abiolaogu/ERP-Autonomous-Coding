import React from "react";
import { Card, Form, Input, Select, InputNumber, Button, Space } from "antd";
import { useForm } from "@refinedev/antd";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/common/PageHeader";
import { MODEL_OPTIONS, LANGUAGE_OPTIONS } from "@/utils/constants";
import type { CodingAgent } from "@/types/coding.types";

const { TextArea } = Input;

export const AgentCreate: React.FC = () => {
  const navigate = useNavigate();

  const { formProps, saveButtonProps } = useForm<CodingAgent>({
    resource: "agents",
    action: "create",
    redirect: "list",
  });

  return (
    <div>
      <PageHeader
        title="Create Agent"
        subtitle="Configure a new autonomous coding agent"
        onBack={() => navigate("/agents")}
        breadcrumbs={[
          { label: "Agents", path: "/agents" },
          { label: "Create" },
        ]}
      />

      <Card style={{ maxWidth: 720 }}>
        <Form
          {...formProps}
          layout="vertical"
          initialValues={{ maxTokens: 100000, language: "TypeScript", model: "claude-opus-4" }}
        >
          <Form.Item
            label="Agent Name"
            name="name"
            rules={[{ required: true, message: "Please enter an agent name" }]}
          >
            <Input placeholder="e.g., TypeScript Refactor Bot" />
          </Form.Item>

          <Form.Item
            label="Description"
            name="description"
            rules={[{ required: true, message: "Please enter a description" }]}
          >
            <TextArea
              rows={3}
              placeholder="Describe what this agent does and its coding responsibilities..."
            />
          </Form.Item>

          <Space size={16} style={{ display: "flex" }}>
            <Form.Item
              label="Language"
              name="language"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select language" options={LANGUAGE_OPTIONS} />
            </Form.Item>

            <Form.Item
              label="Model"
              name="model"
              rules={[{ required: true }]}
              style={{ flex: 1 }}
            >
              <Select placeholder="Select model" options={MODEL_OPTIONS} />
            </Form.Item>
          </Space>

          <Form.Item
            label="Repository URL"
            name="repository"
            rules={[
              { required: true, message: "Please enter a repository URL" },
              { pattern: /^[\w-]+\/[\w.-]+$/, message: "Format: owner/repo" },
            ]}
          >
            <Input placeholder="e.g., org/repository-name" />
          </Form.Item>

          <Form.Item
            label="Max Tokens"
            name="maxTokens"
            rules={[{ required: true }]}
            tooltip="Maximum number of tokens the agent can use per run"
          >
            <InputNumber
              style={{ width: "100%" }}
              min={1000}
              max={1000000}
              step={10000}
              formatter={(value) => `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
              parser={(value) => Number(value?.replace(/,/g, "") ?? 0)}
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 0 }}>
            <Space>
              <Button type="primary" {...saveButtonProps}>
                Create Agent
              </Button>
              <Button onClick={() => navigate("/agents")}>Cancel</Button>
            </Space>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};
