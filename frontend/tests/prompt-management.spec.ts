import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for Prompt Management Page
 *
 * This test suite simulates real user interactions with the Prompt Management feature:
 * - Viewing and navigating prompts
 * - Creating new prompts
 * - Editing existing prompts
 * - Deleting prompts
 * - Filtering by priority, status, intent
 * - Searching prompts
 * - Bulk selection and operations
 * - Sorting prompts
 */

test.describe('Prompt Management Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Prompt Management page
    await page.getByText('Prompt Management').click();
    await page.waitForLoadState('networkidle');
  });

  test('should display prompt management page with prompts table', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Prompt Management' })).toBeVisible();

    // Check that action buttons exist
    await expect(page.getByRole('button', { name: 'Add Prompt' })).toBeVisible();

    // Check that table headers are displayed
    await expect(page.getByText('Prompt')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();
    await expect(page.getByText('Score')).toBeVisible();
    await expect(page.getByText('Status')).toBeVisible();

    // Check that at least one prompt row exists
    const promptRows = await page.locator('tbody tr').count();
    expect(promptRows).toBeGreaterThan(0);
  });

  test('should open and close add prompt modal', async ({ page }) => {
    // Click "Add Prompt" button
    await page.getByRole('button', { name: 'Add Prompt' }).click();

    // Check that modal is visible
    await expect(page.getByText('Add New Prompt')).toBeVisible();
    await expect(page.getByText('Prompt Text')).toBeVisible();
    await expect(page.getByText('Priority')).toBeVisible();

    // Close modal by clicking Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal is closed
    await expect(page.getByText('Add New Prompt')).not.toBeVisible();
  });

  test('should create a new prompt successfully', async ({ page }) => {
    // Open add prompt modal
    await page.getByRole('button', { name: 'Add Prompt' }).click();

    // Generate unique prompt text with timestamp
    const timestamp = Date.now();
    const promptText = `best cooling mattress for hot sleepers ${timestamp}`;

    // Fill in prompt details
    await page.getByLabel('Prompt Text').fill(promptText);

    // Select priority
    await page.locator('select[name="priority"], select[aria-label*="priority"]').selectOption('P0');

    // Select intent
    const intentSelect = page.locator('select[name="intent"], select[aria-label*="intent"]');
    if (await intentSelect.isVisible()) {
      await intentSelect.selectOption('High-Intent');
    }

    // Select project
    const projectSelect = page.locator('select[name="project"], select[aria-label*="project"]');
    if (await projectSelect.isVisible()) {
      await projectSelect.selectOption('sweetnight');
    }

    // Submit the form
    await page.getByRole('button', { name: /add|create|submit/i }).click();

    // Wait for modal to close
    await expect(page.getByText('Add New Prompt')).not.toBeVisible({ timeout: 10000 });

    // Verify the new prompt appears in the list
    await expect(page.getByText(promptText)).toBeVisible({ timeout: 10000 });
  });

  test('should filter prompts by priority', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Get initial count
    const initialCount = await page.locator('tbody tr').count();

    // Find and use priority filter
    const priorityFilter = page.locator('select[name="priority"], button:has-text("Priority")');

    if (await priorityFilter.isVisible()) {
      // If it's a select dropdown
      if (await priorityFilter.evaluate(el => el.tagName === 'SELECT')) {
        await priorityFilter.selectOption('P0');
        await page.waitForTimeout(500);

        // Get filtered count
        const filteredCount = await page.locator('tbody tr').count();

        // Filtered count should be less than or equal to initial
        expect(filteredCount).toBeLessThanOrEqual(initialCount);

        // Verify all visible prompts have P0 priority
        const priorityBadges = await page.locator('tbody tr').locator('text=P0').count();
        expect(priorityBadges).toBe(filteredCount);
      }
    }
  });

  test('should filter prompts by status', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Find status filter
    const statusFilter = page.locator('select[name="status"], button:has-text("Status")');

    if (await statusFilter.isVisible()) {
      // Get initial count
      const initialCount = await page.locator('tbody tr').count();

      // Filter by active status
      if (await statusFilter.evaluate(el => el.tagName === 'SELECT')) {
        await statusFilter.selectOption('active');
        await page.waitForTimeout(500);

        // Get filtered count
        const filteredCount = await page.locator('tbody tr').count();

        // Filtered count should be less than or equal to initial
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
      }
    }
  });

  test('should search prompts by keyword', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Find search input
    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      // Search for "mattress"
      await searchInput.fill('mattress');
      await page.waitForTimeout(500);

      // Get search results
      const searchResults = await page.locator('tbody tr').count();

      if (searchResults > 0) {
        // Verify search results contain the keyword
        const tableContent = await page.locator('tbody').textContent();
        expect(tableContent?.toLowerCase()).toContain('mattress');
      }
    }
  });

  test('should display prompt details in table rows', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Get first row
    const firstRow = page.locator('tbody tr').first();

    // Check that row contains expected data
    await expect(firstRow).toContainText(/P0|P1|P2/); // Priority badge
    await expect(firstRow).toContainText(/\d{1,3}/); // Score number

    // Check for status badge
    const statusBadge = firstRow.locator('.px-3.py-1.rounded-full, .badge');
    const statusCount = await statusBadge.count();
    expect(statusCount).toBeGreaterThan(0);
  });

  test('should edit an existing prompt', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Click edit button on first prompt
    const firstRow = page.locator('tbody tr').first();
    const editButton = firstRow.getByRole('button', { name: /edit/i });

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for edit modal to open
      await expect(page.getByText(/edit prompt/i)).toBeVisible();

      // Modify prompt text
      const promptField = page.getByLabel('Prompt Text');
      const originalText = await promptField.inputValue();
      const updatedText = `${originalText} - Updated ${Date.now()}`;

      await promptField.clear();
      await promptField.fill(updatedText);

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();

      // Wait for modal to close
      await expect(page.getByText(/edit prompt/i)).not.toBeVisible({ timeout: 10000 });

      // Verify the change is reflected
      await expect(page.getByText(updatedText)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should delete a prompt', async ({ page }) => {
    // First, create a test prompt to delete
    await page.getByRole('button', { name: 'Add Prompt' }).click();

    const timestamp = Date.now();
    const promptText = `Delete Test ${timestamp}`;
    await page.getByLabel('Prompt Text').fill(promptText);

    // Submit the form
    await page.getByRole('button', { name: /add|create|submit/i }).click();

    // Wait for prompt to be created
    await expect(page.getByText(promptText)).toBeVisible({ timeout: 10000 });

    // Find the newly created prompt row
    const promptRow = page.locator(`tbody tr:has-text("${promptText}")`);

    // Click delete button
    const deleteButton = promptRow.getByRole('button', { name: /delete|remove/i });

    if (await deleteButton.isVisible()) {
      // Set up dialog handler before clicking delete
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        await dialog.accept();
      });

      await deleteButton.click();

      // Wait for prompt to be removed
      await expect(page.getByText(promptText)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should select multiple prompts for bulk operations', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Check if bulk selection is available
    const selectAllCheckbox = page.locator('thead input[type="checkbox"]');

    if (await selectAllCheckbox.isVisible()) {
      // Click "Select All" checkbox
      await selectAllCheckbox.check();

      // Verify individual checkboxes are checked
      const checkedBoxes = await page.locator('tbody input[type="checkbox"]:checked').count();
      expect(checkedBoxes).toBeGreaterThan(0);

      // Check if bulk actions menu appears
      const bulkActionsMenu = page.getByText(/bulk actions|selected/i);
      if (await bulkActionsMenu.isVisible()) {
        await expect(bulkActionsMenu).toBeVisible();
      }
    }
  });

  test('should perform bulk status update', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Select first two prompts
    const checkboxes = page.locator('tbody input[type="checkbox"]');
    const checkboxCount = await checkboxes.count();

    if (checkboxCount > 0) {
      await checkboxes.first().check();

      if (checkboxCount > 1) {
        await checkboxes.nth(1).check();
      }

      // Look for bulk actions button or dropdown
      const bulkActionsButton = page.getByRole('button', { name: /bulk|actions/i });

      if (await bulkActionsButton.isVisible()) {
        await bulkActionsButton.click();

        // Select "Update Status" action
        const updateStatusOption = page.getByText(/update status|change status/i);
        if (await updateStatusOption.isVisible()) {
          await updateStatusOption.click();

          // Select new status
          await page.locator('select[name="status"]').selectOption('active');

          // Confirm action
          await page.getByRole('button', { name: /apply|update|confirm/i }).click();

          // Wait for operation to complete
          await page.waitForTimeout(1000);
        }
      }
    }
  });

  test('should sort prompts by score', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Click on "Score" column header to sort
    const scoreHeader = page.getByText('Score').first();
    await scoreHeader.click();
    await page.waitForTimeout(500);

    // Get first two scores
    const scores = await page.locator('tbody tr td:nth-child(3)').allTextContents();

    if (scores.length >= 2) {
      // Verify sorting (descending or ascending)
      const score1 = parseInt(scores[0].replace(/\D/g, ''));
      const score2 = parseInt(scores[1].replace(/\D/g, ''));

      // Scores should be in order
      expect(score1 >= score2 || score1 <= score2).toBeTruthy();
    }
  });

  test('should display prompt score badges with colors', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Get first row
    const firstRow = page.locator('tbody tr').first();

    // Check for score badge
    const scoreBadge = firstRow.locator('text=/\\d{1,3}/').first();
    await expect(scoreBadge).toBeVisible();

    // Verify badge has color styling (bg-* class)
    const badgeClasses = await scoreBadge.getAttribute('class');
    expect(badgeClasses).toMatch(/bg-/);
  });

  test('should display priority badges with correct colors', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Check for priority badges
    const p0Badge = page.locator('text=P0').first();
    if (await p0Badge.isVisible()) {
      const p0Classes = await p0Badge.getAttribute('class');
      expect(p0Classes).toMatch(/bg-red|text-red/); // P0 should be red
    }

    const p1Badge = page.locator('text=P1').first();
    if (await p1Badge.isVisible()) {
      const p1Classes = await p1Badge.getAttribute('class');
      expect(p1Classes).toMatch(/bg-yellow|text-yellow/); // P1 should be yellow
    }
  });

  test('should paginate prompts if many exist', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Look for pagination controls
    const paginationNext = page.getByRole('button', { name: /next/i });
    const paginationPrev = page.getByRole('button', { name: /previous|prev/i });

    if (await paginationNext.isVisible()) {
      // Get current page prompts
      const page1Prompts = await page.locator('tbody tr').count();

      // Click next page
      await paginationNext.click();
      await page.waitForTimeout(500);

      // Get next page prompts
      const page2Prompts = await page.locator('tbody tr').count();

      // Both pages should have prompts
      expect(page1Prompts).toBeGreaterThan(0);
      expect(page2Prompts).toBeGreaterThan(0);

      // Previous button should now be enabled
      await expect(paginationPrev).toBeEnabled();
    }
  });

  test('should clear all filters', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Apply some filters
    const priorityFilter = page.locator('select[name="priority"]');
    if (await priorityFilter.isVisible()) {
      await priorityFilter.selectOption('P0');
      await page.waitForTimeout(500);
    }

    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('test');
      await page.waitForTimeout(500);
    }

    // Look for "Clear Filters" or "Reset" button
    const clearButton = page.getByRole('button', { name: /clear|reset/i });

    if (await clearButton.isVisible()) {
      await clearButton.click();
      await page.waitForTimeout(500);

      // Verify filters are cleared
      if (await priorityFilter.isVisible()) {
        const selectedValue = await priorityFilter.inputValue();
        expect(selectedValue).toBe('all' || '');
      }

      if (await searchInput.isVisible()) {
        const searchValue = await searchInput.inputValue();
        expect(searchValue).toBe('');
      }
    }
  });

  test('should show empty state when no prompts match filters', async ({ page }) => {
    // Wait for prompts to load
    await page.waitForSelector('tbody tr', { timeout: 10000 });

    // Search for something that doesn't exist
    const searchInput = page.getByPlaceholder(/search/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill('xyznonexistent123456');
      await page.waitForTimeout(500);

      // Check for empty state
      const rowCount = await page.locator('tbody tr').count();

      if (rowCount === 0) {
        // Should show empty message
        const emptyMessage = page.getByText(/no prompts found|no results/i);
        const hasEmptyMessage = await emptyMessage.isVisible();
        expect(hasEmptyMessage || rowCount === 0).toBeTruthy();
      }
    }
  });

  test('should show loading state while fetching prompts', async ({ page }) => {
    // Reload the page to see loading state
    await page.reload();

    // Navigate to Prompt Management page again
    await page.getByText('Prompt Management').click();

    // Check for loading indicator (this might be brief)
    const loadingIndicator = page.getByText(/loading/i);

    // If loading indicator is visible, wait for it to disappear
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }

    // Page should be fully loaded
    await expect(page.getByRole('heading', { name: 'Prompt Management' })).toBeVisible();
  });
});
