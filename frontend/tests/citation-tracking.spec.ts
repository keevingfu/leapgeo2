import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for Citation Tracking Page
 *
 * This test suite simulates real user interactions with the Citation Tracking feature:
 * - Navigating to the page
 * - Viewing citation statistics
 * - Scanning for new citations across AI platforms
 * - Filtering citations by project
 * - Searching citations by keyword
 */

test.describe('Citation Tracking Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Citation Tracking page
    await page.getByText('Citation Tracking').click();
    await page.waitForLoadState('networkidle');
  });

  test('should display citation tracking page with statistics', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'AI Citation Tracking' })).toBeVisible();

    // Check that statistics cards are displayed
    await expect(page.getByText('Total Citations')).toBeVisible();
    await expect(page.getByText('Avg Citation Rate')).toBeVisible();
    await expect(page.getByText('Top Position (#1)')).toBeVisible();
    await expect(page.getByText('Active Platforms')).toBeVisible();

    // Check that the "Scan New Citations" button exists
    await expect(page.getByRole('button', { name: 'Scan New Citations' })).toBeVisible();
  });

  test('should open and close scan modal', async ({ page }) => {
    // Click "Scan New Citations" button
    await page.getByRole('button', { name: 'Scan New Citations' }).click();

    // Check that modal is visible
    await expect(page.getByText('Scan for Citations')).toBeVisible();
    await expect(page.getByText('Select Project')).toBeVisible();
    await expect(page.getByText('Enter Prompt')).toBeVisible();
    await expect(page.getByText('Select Platforms')).toBeVisible();

    // Close modal by clicking Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal is closed
    await expect(page.getByText('Scan for Citations')).not.toBeVisible();
  });

  test('should validate required fields in scan form', async ({ page }) => {
    // Open scan modal
    await page.getByRole('button', { name: 'Scan New Citations' }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Start Scan' }).click();

    // Check for validation error
    await expect(page.getByText('Please enter a prompt and select a project')).toBeVisible();
  });

  test('should perform citation scan successfully', async ({ page }) => {
    // Open scan modal
    await page.getByRole('button', { name: 'Scan New Citations' }).click();

    // Select a project (assuming "sweetnight" exists)
    await page.locator('select').first().selectOption('sweetnight');

    // Enter a prompt
    await page.getByPlaceholder('e.g., best cooling mattress').fill('best cooling mattress for hot sleepers');

    // Select platforms (check ChatGPT and Perplexity)
    await page.getByLabel('ChatGPT').check();
    await page.getByLabel('Perplexity').check();

    // Submit the scan
    await page.getByRole('button', { name: 'Start Scan' }).click();

    // Wait for scanning indicator to appear
    await expect(page.getByText('Scanning...')).toBeVisible();

    // Wait for scan to complete (this may take a while)
    // Use a longer timeout since real API calls are being made
    await expect(page.getByText('Scan completed successfully!')).toBeVisible({ timeout: 120000 });

    // Check that results are displayed
    await expect(page.getByText(/citations found/i)).toBeVisible();
    await expect(page.getByText(/platforms scanned/i)).toBeVisible();
  });

  test('should filter citations by project', async ({ page }) => {
    // Wait for citations to load
    await page.waitForSelector('text=Citation List', { timeout: 10000 });

    // Get initial citation count
    const allCitationsCount = await page.locator('tbody tr').count();

    // Filter by specific project
    await page.locator('select').first().selectOption('sweetnight');
    await page.waitForTimeout(500); // Wait for filter to apply

    // Get filtered citation count
    const filteredCount = await page.locator('tbody tr').count();

    // Filtered count should be less than or equal to all citations
    expect(filteredCount).toBeLessThanOrEqual(allCitationsCount);

    // Verify all visible citations are from the selected project
    const projectCells = await page.locator('tbody tr td:nth-child(5)').allTextContents();
    projectCells.forEach(cell => {
      expect(cell.toLowerCase()).toContain('sweetnight');
    });
  });

  test('should search citations by keyword', async ({ page }) => {
    // Wait for citations to load
    await page.waitForSelector('text=Citation List', { timeout: 10000 });

    // Enter search term
    await page.getByPlaceholder('Search by platform, prompt, or source').fill('mattress');
    await page.waitForTimeout(500); // Wait for search to apply

    // Get search results
    const searchResults = await page.locator('tbody tr').count();
    expect(searchResults).toBeGreaterThan(0);

    // Verify search results contain the keyword
    const resultText = await page.locator('tbody').textContent();
    expect(resultText?.toLowerCase()).toContain('mattress');
  });

  test('should display platform distribution', async ({ page }) => {
    // Check that platform distribution section exists
    await expect(page.getByText('Platform Distribution')).toBeVisible();

    // Check that at least one platform is displayed
    const platformItems = await page.locator('text=/ChatGPT|Claude|Perplexity|Gemini/').count();
    expect(platformItems).toBeGreaterThan(0);
  });

  test('should display citation details in table', async ({ page }) => {
    // Wait for table to load
    await page.waitForSelector('table', { timeout: 10000 });

    // Check table headers
    await expect(page.getByText('Platform')).toBeVisible();
    await expect(page.getByText('Prompt')).toBeVisible();
    await expect(page.getByText('Source')).toBeVisible();
    await expect(page.getByText('Position')).toBeVisible();
    await expect(page.getByText('Project')).toBeVisible();
    await expect(page.getByText('Detected')).toBeVisible();

    // Check that at least one row exists (excluding header)
    const rowCount = await page.locator('tbody tr').count();
    expect(rowCount).toBeGreaterThan(0);
  });

  test('should handle empty search results gracefully', async ({ page }) => {
    // Wait for citations to load
    await page.waitForSelector('text=Citation List', { timeout: 10000 });

    // Search for something that doesn't exist
    await page.getByPlaceholder('Search by platform, prompt, or source').fill('xyznonexistent123');
    await page.waitForTimeout(500);

    // Check for no results message
    const rowCount = await page.locator('tbody tr').count();

    if (rowCount === 0) {
      // Table should be empty
      expect(rowCount).toBe(0);
    } else {
      // Or show "No citations found" message
      const emptyMessage = await page.getByText(/no citations/i).isVisible();
      expect(emptyMessage).toBeTruthy();
    }
  });

  test('should show loading state while fetching data', async ({ page }) => {
    // Reload the page to see loading state
    await page.reload();

    // Navigate to Citation Tracking page again
    await page.getByText('Citation Tracking').click();

    // Check for loading indicator (this might be brief)
    const loadingIndicator = page.getByText(/loading/i);

    // If loading indicator is visible, wait for it to disappear
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }

    // Page should be fully loaded
    await expect(page.getByRole('heading', { name: 'AI Citation Tracking' })).toBeVisible();
  });

  test('should clear search when input is emptied', async ({ page }) => {
    // Wait for citations to load
    await page.waitForSelector('text=Citation List', { timeout: 10000 });

    // Get initial count
    const initialCount = await page.locator('tbody tr').count();

    // Search for something
    const searchInput = page.getByPlaceholder('Search by platform, prompt, or source');
    await searchInput.fill('mattress');
    await page.waitForTimeout(500);

    // Get search results count
    const searchCount = await page.locator('tbody tr').count();

    // Clear search
    await searchInput.clear();
    await page.waitForTimeout(500);

    // Count should return to initial (or close to it)
    const finalCount = await page.locator('tbody tr').count();
    expect(finalCount).toBeGreaterThanOrEqual(searchCount);
  });

  test('should reset to "all projects" when filter is changed', async ({ page }) => {
    // Wait for citations to load
    await page.waitForSelector('text=Citation List', { timeout: 10000 });

    // Filter by specific project
    const projectSelect = page.locator('select').first();
    await projectSelect.selectOption('sweetnight');
    await page.waitForTimeout(500);

    // Get filtered count
    const filteredCount = await page.locator('tbody tr').count();

    // Reset to "all projects"
    await projectSelect.selectOption('all');
    await page.waitForTimeout(500);

    // Get count after reset
    const allCount = await page.locator('tbody tr').count();

    // All count should be >= filtered count
    expect(allCount).toBeGreaterThanOrEqual(filteredCount);
  });
});
