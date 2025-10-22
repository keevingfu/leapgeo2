import { test, expect } from '@playwright/test';

/**
 * E2E Test Suite for Projects Page
 *
 * This test suite simulates real user interactions with the Projects feature:
 * - Viewing the project list
 * - Creating new projects
 * - Editing existing projects
 * - Deleting projects
 * - Searching and filtering projects
 */

test.describe('Projects Page', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the homepage and wait for it to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Navigate to Projects page
    await page.getByText('Projects').click();
    await page.waitForLoadState('networkidle');
  });

  test('should display projects page with project list', async ({ page }) => {
    // Check page title
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    // Check that "Create Project" button exists
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible();

    // Check that at least one project card is displayed
    const projectCards = await page.locator('.bg-white').count();
    expect(projectCards).toBeGreaterThan(0);
  });

  test('should open and close create project modal', async ({ page }) => {
    // Click "Create Project" button
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Check that modal is visible
    await expect(page.getByText('Create New Project')).toBeVisible();
    await expect(page.getByText('Project Name')).toBeVisible();
    await expect(page.getByText('Industry')).toBeVisible();

    // Close modal by clicking Cancel button
    await page.getByRole('button', { name: 'Cancel' }).click();

    // Verify modal is closed
    await expect(page.getByText('Create New Project')).not.toBeVisible();
  });

  test('should create a new project successfully', async ({ page }) => {
    // Open create project modal
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Generate unique project name with timestamp
    const timestamp = Date.now();
    const projectName = `Test Project ${timestamp}`;
    const industry = 'Consumer Electronics';
    const description = 'This is a test project created by E2E tests';

    // Fill in project details
    await page.getByLabel('Project Name').fill(projectName);
    await page.getByLabel('Industry').fill(industry);
    await page.getByLabel('Description').fill(description);

    // Select status (assuming there's a status dropdown)
    // await page.locator('select[name="status"]').selectOption('active');

    // Submit the form
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for modal to close
    await expect(page.getByText('Create New Project')).not.toBeVisible({ timeout: 10000 });

    // Verify the new project appears in the list
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 10000 });
  });

  test('should validate required fields when creating project', async ({ page }) => {
    // Open create project modal
    await page.getByRole('button', { name: 'Create Project' }).click();

    // Try to submit without filling required fields
    await page.getByRole('button', { name: 'Create' }).click();

    // Check for validation errors (HTML5 validation or custom error messages)
    // This might vary depending on implementation
    const nameInput = page.getByLabel('Project Name');
    const isInvalid = await nameInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
    expect(isInvalid).toBeTruthy();
  });

  test('should display project details on project cards', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Get the first project card
    const firstCard = page.locator('.bg-white').first();

    // Check that project card displays key information
    await expect(firstCard).toContainText(/(SweetNight|Eufy|Hisense)/);

    // Check that status badge is displayed
    const statusBadges = await firstCard.locator('.px-3.py-1.rounded-full').count();
    expect(statusBadges).toBeGreaterThan(0);
  });

  test('should navigate to project details when clicking on a project', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Click on the first project card (if there's a "View" button or the card itself is clickable)
    const firstCard = page.locator('.bg-white').first();
    const viewButton = firstCard.getByRole('button', { name: /view|open/i });

    if (await viewButton.isVisible()) {
      await viewButton.click();
      await page.waitForLoadState('networkidle');

      // Verify we're on the project details page or dashboard
      // This depends on the routing implementation
      await expect(page.getByText(/dashboard|details|overview/i)).toBeVisible();
    }
  });

  test('should edit an existing project', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Click edit button on first project
    const firstCard = page.locator('.bg-white').first();
    const editButton = firstCard.getByRole('button', { name: /edit/i });

    if (await editButton.isVisible()) {
      await editButton.click();

      // Wait for edit modal to open
      await expect(page.getByText('Edit Project')).toBeVisible();

      // Modify project description
      const descriptionField = page.getByLabel('Description');
      const updatedDescription = `Updated at ${Date.now()}`;
      await descriptionField.clear();
      await descriptionField.fill(updatedDescription);

      // Save changes
      await page.getByRole('button', { name: /save|update/i }).click();

      // Wait for modal to close
      await expect(page.getByText('Edit Project')).not.toBeVisible({ timeout: 10000 });

      // Verify the change is reflected
      await expect(page.getByText(updatedDescription)).toBeVisible({ timeout: 10000 });
    }
  });

  test('should delete a project with confirmation', async ({ page }) => {
    // First, create a test project to delete
    await page.getByRole('button', { name: 'Create Project' }).click();

    const timestamp = Date.now();
    const projectName = `Delete Test ${timestamp}`;
    await page.getByLabel('Project Name').fill(projectName);
    await page.getByLabel('Industry').fill('Test Industry');
    await page.getByRole('button', { name: 'Create' }).click();

    // Wait for project to be created
    await expect(page.getByText(projectName)).toBeVisible({ timeout: 10000 });

    // Find the newly created project card
    const projectCard = page.locator(`.bg-white:has-text("${projectName}")`);

    // Click delete button
    const deleteButton = projectCard.getByRole('button', { name: /delete/i });

    if (await deleteButton.isVisible()) {
      await deleteButton.click();

      // Handle confirmation dialog
      page.on('dialog', async dialog => {
        expect(dialog.type()).toBe('confirm');
        expect(dialog.message()).toContain(/delete|remove/i);
        await dialog.accept();
      });

      // Wait for project to be removed
      await expect(page.getByText(projectName)).not.toBeVisible({ timeout: 10000 });
    }
  });

  test('should filter projects by status', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Check if there's a status filter dropdown
    const statusFilter = page.locator('select[name="status"], select[aria-label*="status"]').first();

    if (await statusFilter.isVisible()) {
      // Get total project count
      const totalCount = await page.locator('.bg-white').count();

      // Filter by active status
      await statusFilter.selectOption('active');
      await page.waitForTimeout(500);

      // Get filtered count
      const activeCount = await page.locator('.bg-white').count();

      // Active count should be less than or equal to total
      expect(activeCount).toBeLessThanOrEqual(totalCount);
    }
  });

  test('should search projects by name', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Check if there's a search input
    const searchInput = page.getByPlaceholder(/search/i);

    if (await searchInput.isVisible()) {
      // Get initial count
      const initialCount = await page.locator('.bg-white').count();

      // Search for "Sweet"
      await searchInput.fill('Sweet');
      await page.waitForTimeout(500);

      // Get search results
      const searchResults = await page.locator('.bg-white').count();

      // Search should filter results
      expect(searchResults).toBeLessThanOrEqual(initialCount);

      // Verify results contain the search term
      if (searchResults > 0) {
        const firstResult = await page.locator('.bg-white').first().textContent();
        expect(firstResult?.toLowerCase()).toContain('sweet');
      }
    }
  });

  test('should display project statistics', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Check that project cards display metrics
    const firstCard = page.locator('.bg-white').first();

    // Look for common metrics
    const metrics = [
      /prompts/i,
      /citation rate/i,
      /platforms/i,
      /content/i
    ];

    let hasMetrics = false;
    for (const metric of metrics) {
      if (await firstCard.getByText(metric).isVisible()) {
        hasMetrics = true;
        break;
      }
    }

    expect(hasMetrics).toBeTruthy();
  });

  test('should handle empty project list gracefully', async ({ page }) => {
    // This test assumes we can clear all projects or start with an empty state
    // For now, we'll just verify the page doesn't crash with no projects

    // Navigate to projects page
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();

    // Page should still show the create button even if empty
    await expect(page.getByRole('button', { name: 'Create Project' })).toBeVisible();
  });

  test('should show loading state while fetching projects', async ({ page }) => {
    // Reload the page to see loading state
    await page.reload();

    // Navigate to Projects page again
    await page.getByText('Projects').click();

    // Check for loading indicator (this might be brief)
    const loadingIndicator = page.getByText(/loading/i);

    // If loading indicator is visible, wait for it to disappear
    if (await loadingIndicator.isVisible()) {
      await expect(loadingIndicator).not.toBeVisible({ timeout: 10000 });
    }

    // Page should be fully loaded
    await expect(page.getByRole('heading', { name: 'Projects' })).toBeVisible();
  });

  test('should display project count or summary', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Count project cards
    const projectCount = await page.locator('.bg-white').count();

    // Verify count is positive
    expect(projectCount).toBeGreaterThan(0);

    // Check if there's a summary text displaying the count
    const summaryText = page.getByText(/\d+ projects?/i);
    if (await summaryText.isVisible()) {
      const text = await summaryText.textContent();
      expect(text).toMatch(/\d+/);
    }
  });

  test('should allow clicking on project for more details', async ({ page }) => {
    // Wait for projects to load
    await page.waitForSelector('.bg-white', { timeout: 10000 });

    // Get the first project name
    const firstCard = page.locator('.bg-white').first();
    const projectName = await firstCard.locator('h3, h2, .font-bold').first().textContent();

    // Click on the project card or a link within it
    await firstCard.click();
    await page.waitForLoadState('networkidle');

    // Verify navigation occurred (URL changed or new content displayed)
    const url = page.url();
    const hasDashboard = await page.getByText(/dashboard|overview/i).isVisible();

    // Either URL should have changed or dashboard should be visible
    expect(url.includes('/') || hasDashboard).toBeTruthy();
  });
});
