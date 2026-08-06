import { Request, Response } from 'express';
import { StateService } from '../services/state.service';
import * as R from '../../../shared/lib/response';
import { toBigInt, toStringId } from '../../../shared/utils/bigint';

export class StateController {
  /**
   * GET /admin/states
   * List all active states
   */
  static async list(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth?.orgId);
      if (!orgId) {
        return res.status(401).json({ error: 'Organisation not found' });
      }

      const states = await StateService.list(orgId);

      const mapped = states.map((state) => ({
        id: toStringId(state.id),
        tag: state.tag,
        name: state.name,
        code: state.code,
        zipCode: state.zipCode,
        country: state.country,
        region: state.region,
        isActive: state.isActive,
        createdAt: state.createdAt,
      }));

      res.json(mapped);
    } catch (error) {
      console.error('Error listing states:', error);
      res.status(500).json({ error: 'Failed to list states' });
    }
  }

  /**
   * GET /admin/states/:id
   * Get a single state by ID
   */
  static async get(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth?.orgId);
      const stateId = toBigInt(req.params.id);

      if (!orgId || !stateId) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      const state = await StateService.getById(orgId, stateId);

      if (!state) {
        return res.status(404).json({ error: 'State not found' });
      }

      res.json({
        id: toStringId(state.id),
        tag: state.tag,
        name: state.name,
        code: state.code,
        zipCode: state.zipCode,
        country: state.country,
        region: state.region,
        isActive: state.isActive,
        createdAt: state.createdAt,
      });
    } catch (error) {
      console.error('Error fetching state:', error);
      res.status(500).json({ error: 'Failed to fetch state' });
    }
  }

  /**
   * POST /admin/states
   * Create a new state
   */
  static async create(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth?.orgId);

      if (!orgId) {
        return res.status(401).json({ error: 'Organisation not found' });
      }

      const { tag, name, code, zipCode, country, region, isActive } = req.body;

      if (!tag || !name) {
        return res.status(400).json({ error: 'Tag and name are required' });
      }

      const state = await StateService.create(orgId, {
        tag,
        name,
        code,
        zipCode,
        country: country || 'PK',
        region,
        isActive: isActive !== false,
      });

      res.status(201).json({
        id: toStringId(state.id),
        tag: state.tag,
        name: state.name,
        code: state.code,
        zipCode: state.zipCode,
        country: state.country,
        region: state.region,
        isActive: state.isActive,
        createdAt: state.createdAt,
      });
    } catch (error: any) {
      console.error('Error creating state:', error);
      if (error.message === 'DUPLICATE_TAG') {
        return res.status(409).json({ error: 'DUPLICATE_TAG' });
      }
      res.status(500).json({ error: 'Failed to create state' });
    }
  }

  /**
   * PATCH /admin/states/:id
   * Update an existing state
   */
  static async update(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth?.orgId);
      const stateId = toBigInt(req.params.id);

      if (!orgId || !stateId) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      const state = await StateService.update(orgId, stateId, req.body);

      res.json({
        id: toStringId(state.id),
        tag: state.tag,
        name: state.name,
        code: state.code,
        zipCode: state.zipCode,
        country: state.country,
        region: state.region,
        isActive: state.isActive,
        createdAt: state.createdAt,
      });
    } catch (error: any) {
      console.error('Error updating state:', error);
      if (error.message === 'STATE_NOT_FOUND') {
        return res.status(404).json({ error: 'State not found' });
      }
      if (error.message === 'DUPLICATE_TAG') {
        return res.status(409).json({ error: 'DUPLICATE_TAG' });
      }
      res.status(500).json({ error: 'Failed to update state' });
    }
  }

  /**
   * DELETE /admin/states/:id
   * Soft delete a state
   */
  static async delete(req: Request, res: Response) {
    try {
      const orgId = toBigInt(req.auth?.orgId);
      const stateId = toBigInt(req.params.id);

      if (!orgId || !stateId) {
        return res.status(400).json({ error: 'Invalid parameters' });
      }

      await StateService.delete(orgId, stateId);

      R.noContent(res);
    } catch (error: any) {
      console.error('Error deleting state:', error);
      if (error.message === 'STATE_NOT_FOUND') {
        return res.status(404).json({ error: 'State not found' });
      }
      if (error.message === 'HAS_ACTIVE_CITIES') {
        return res.status(400).json({ error: 'Cannot delete state with active cities' });
      }
      res.status(500).json({ error: 'Failed to delete state' });
    }
  }
}
