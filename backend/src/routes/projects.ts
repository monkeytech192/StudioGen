import { Router, Response } from 'express';
import { prisma } from '../lib/prisma.js';
import { authenticate, AuthenticatedRequest } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { asyncHandler } from '../middleware/error.js';
import { createProjectSchema, updateProjectSchema, addImageSchema } from '../schemas/index.js';

const router = Router();

// All routes require authentication
router.use(authenticate);

/**
 * GET /projects
 * Get all projects for authenticated user
 */
router.get(
  '/',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projects = await prisma.project.findMany({
      where: { userId: req.user!.userId },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
          take: 4, // Preview images
        },
        _count: {
          select: { images: true },
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    res.json({
      success: true,
      data: projects.map((project) => ({
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.getTime(),
        updatedAt: project.updatedAt.getTime(),
        imageCount: project._count.images,
        previewImages: project.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
        })),
      })),
    });
  })
);

/**
 * POST /projects
 * Create a new project
 */
router.post(
  '/',
  validate(createProjectSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { name } = req.body;

    const project = await prisma.project.create({
      data: {
        name,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.getTime(),
        updatedAt: project.updatedAt.getTime(),
        images: [],
      },
    });
  })
);

/**
 * GET /projects/:projectId
 * Get a single project with all images
 */
router.get(
  '/:projectId',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projectId = req.params.projectId as string;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.userId,
      },
      include: {
        images: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    res.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.getTime(),
        updatedAt: project.updatedAt.getTime(),
        images: project.images.map((img) => ({
          id: img.id,
          imageUrl: img.imageUrl,
          prompt: img.prompt,
          settings: img.settings,
          createdAt: img.createdAt.getTime(),
        })),
      },
    });
  })
);

/**
 * PATCH /projects/:projectId
 * Update a project
 */
router.patch(
  '/:projectId',
  validate(updateProjectSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projectId = req.params.projectId as string;
    const updates = req.body;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.userId,
      },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    const project = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(updates.name && { name: updates.name }),
      },
    });

    res.json({
      success: true,
      data: {
        id: project.id,
        name: project.name,
        createdAt: project.createdAt.getTime(),
        updatedAt: project.updatedAt.getTime(),
      },
    });
  })
);

/**
 * DELETE /projects/:projectId
 * Delete a project and all its images
 */
router.delete(
  '/:projectId',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projectId = req.params.projectId as string;

    // Verify ownership
    const existing = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.userId,
      },
    });

    if (!existing) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    await prisma.project.delete({
      where: { id: projectId },
    });

    res.json({
      success: true,
      message: 'Project deleted successfully',
    });
  })
);

/**
 * POST /projects/:projectId/images
 * Add an image to a project
 */
router.post(
  '/:projectId/images',
  validate(addImageSchema),
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projectId = req.params.projectId as string;
    const { imageUrl, prompt, settings } = req.body;

    // Verify ownership
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.userId,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    const image = await prisma.projectImage.create({
      data: {
        projectId: projectId,
        imageUrl,
        prompt: prompt || '',
        settings: settings || undefined,
      },
    });

    // Update project's updatedAt
    await prisma.project.update({
      where: { id: projectId },
      data: { updatedAt: new Date() },
    });

    res.status(201).json({
      success: true,
      data: {
        id: image.id,
        imageUrl: image.imageUrl,
        prompt: image.prompt,
        settings: image.settings,
        createdAt: image.createdAt.getTime(),
      },
    });
  })
);

/**
 * DELETE /projects/:projectId/images/:imageId
 * Delete an image from a project
 */
router.delete(
  '/:projectId/images/:imageId',
  asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const projectId = req.params.projectId as string;
    const imageId = req.params.imageId as string;

    // Verify ownership through project
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        userId: req.user!.userId,
      },
    });

    if (!project) {
      res.status(404).json({
        success: false,
        error: 'Project not found',
      });
      return;
    }

    const image = await prisma.projectImage.findFirst({
      where: {
        id: imageId,
        projectId: projectId,
      },
    });

    if (!image) {
      res.status(404).json({
        success: false,
        error: 'Image not found',
      });
      return;
    }

    await prisma.projectImage.delete({
      where: { id: imageId },
    });

    res.json({
      success: true,
      message: 'Image deleted successfully',
    });
  })
);

export default router;
