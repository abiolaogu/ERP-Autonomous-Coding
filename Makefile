.PHONY: test test-integration test-e2e

test:
	go test ./cmd/server ./cli

test-integration:
	@echo "integration placeholder for provider webhooks and CI orchestration"

test-e2e:
	@echo "e2e placeholder for issue -> branch -> PR -> review flow"
